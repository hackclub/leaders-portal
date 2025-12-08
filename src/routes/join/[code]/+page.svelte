<script>
	export let data;

	$: code = data.code;
	$: clubName = data.clubName;
	$: iframeSrc = clubName 
		? `https://forms.hackclub.com/join-club?code=${code}&name=${encodeURIComponent(clubName)}`
		: `https://forms.hackclub.com/join-club?code=${code}`;
</script>

<svelte:head>
	<title>Join Club</title>
</svelte:head>

<iframe
	src={iframeSrc}
	title="Join Club Form"
></iframe>

<style>
	iframe {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		border: none;
	}
</style>
