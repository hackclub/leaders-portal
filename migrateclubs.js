require("dotenv").config();
const Airtable = require("airtable");

const API_KEY = process.env.AIRTABLE_API_KEY;

// ---- Configuration ----
const SRC_BASE_ID = "appUfrUFraxH3D5Ob";
const SRC_TABLE_ID = "tblsA5iv6Fz0qxHFC";
const DST_BASE_ID = "appp4NIEQ1dPlduZq";
const DST_TABLE_ID = "tbldUfSnhv27ADL9H";
const COUNT = 50

// Leaders tables (referenced by name in both bases).
const SRC_LEADERS_TABLE = "Leaders";
const DST_LEADERS_TABLE = "Leaders";

const FIELD_MAP = {
  club_name: "club_name",
  club_status: "status",
  notes: "team_notes",
  venue_name: "venue_name",
  venue_address_line_1: "venue_addr_line_1",
  venue_address_line_2: "venue_addr_line_2",
  venue_address_city: "venue_addr_city",
  venue_address_state: "venue_addr_state",
  venue_address_country: "venue_addr_country",
  venue_address_zip: "venue_addr_zip",
  venue_lat: "venue_lat",
  venue_lng: "venue_lng",
  club_website: "club_website",
  level: "level"
};

const LEADER_FIELD_MAP = {
  first_name: "name_first",
  last_name: "name_last",
  "Clubs Team Notes": "team_notes",
  email: "contact_email",
  phone_number: "contact_phone",
  slack_id: "contact_slack",
  birthday: "birthday",
  graduation_year: "graduation_year",
  address_line_1: "lead_addr_line_1",
  address_line_2: "lead_addr_line_2",
  address_city: "lead_addr_city",
  address_zip_code: "lead_addr_zip",
  address_state: "lead_addr_state",
  address_county: "lead_addr_country",
};


async function main() {
  if (!SRC_BASE_ID || !SRC_TABLE_ID || !DST_BASE_ID || !DST_TABLE_ID) {
    console.error(
      "Please set SRC_BASE_ID, SRC_TABLE_ID, DST_BASE_ID and DST_TABLE_ID in the script."
    );
    process.exit(1);
  }

  if (!API_KEY) {
    console.error("Missing AIRTABLE_API_KEY in .env");
    process.exit(1);
  }

  const count = COUNT;
  if (!Number.isInteger(count) || count <= 0) {
    console.error(`Invalid COUNT: ${COUNT}`);
    process.exit(1);
  }

  Airtable.configure({ apiKey: API_KEY });

  const srcTable = new Airtable().base(SRC_BASE_ID)(SRC_TABLE_ID);
  const dstTable = new Airtable().base(DST_BASE_ID)(DST_TABLE_ID);
  const srcLeaders = new Airtable().base(SRC_BASE_ID)(SRC_LEADERS_TABLE);
  const dstLeaders = new Airtable().base(DST_BASE_ID)(DST_LEADERS_TABLE);

  // Fetch records where status = Active and venue_name is not empty.
  console.log(`Fetching up to ${count} matching records from source...`);
  const srcRecords = await srcTable
    .select({
      maxRecords: count,
      pageSize: Math.min(count, 100),
      filterByFormula: "AND({club_status} = 'Active', {venue_name} != '')",
    })
    .all();

  console.log(`Fetched ${srcRecords.length} records.`);

  // Map the fields.
  const STATUS_MAP = {
    "Pre-Ship": "Pending",
    "Pending Application": "Pending",
  };

  const newRecords = srcRecords.map((r) => {
    const fields = {};
    for (const [oldField, newField] of Object.entries(FIELD_MAP)) {
      let value = r.get(oldField);
      if (oldField === "club_status" && value in STATUS_MAP) {
        value = STATUS_MAP[value];
      }
      if (value !== undefined && value !== null && value !== "") {
        fields[newField] = value;
      }
    }
    return { fields };
  });

  // Airtable create allows max 10 records per request.
  // Track the source club alongside the newly created club so we can migrate leaders.
  const createdClubs = []; // { srcRecord, newId }
  for (let i = 0; i < newRecords.length; i += 10) {
    const batch = newRecords.slice(i, i + 10);
    const result = await dstTable.create(batch);
    result.forEach((rec, j) => {
      createdClubs.push({ srcRecord: srcRecords[i + j], newId: rec.id });
    });
    console.log(`Created ${createdClubs.length}/${newRecords.length} clubs...`);
  }

  console.log(`Done. Migrated ${createdClubs.length} clubs.`);

  // Migrate each club's leader.
  console.log("Migrating leaders...");
  let leadersMigrated = 0;
  for (const { srcRecord, newId } of createdClubs) {
    const rel = srcRecord.get("rel_leader");
    const leaderId = Array.isArray(rel) ? rel[0] : rel;
    if (!leaderId) {
      console.log(`Club ${srcRecord.get("club_name")} has no leader, skipping.`);
      continue;
    }

    let leaderRecord;
    try {
      leaderRecord = await srcLeaders.find(leaderId);
    } catch (err) {
      console.warn(`Could not fetch leader ${leaderId}: ${err.message}`);
      continue;
    }

    const fields = { rel_clubs: [newId] };
    for (const [oldField, newField] of Object.entries(LEADER_FIELD_MAP)) {
      const value = leaderRecord.get(oldField);
      if (value !== undefined && value !== null && value !== "") {
        fields[newField] = value;
      }
    }

    await dstLeaders.create([{ fields }]);
    leadersMigrated++;
    console.log(`Migrated leader ${leadersMigrated}/${createdClubs.length}...`);
  }

  console.log(`Done. Migrated ${leadersMigrated} leaders.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});