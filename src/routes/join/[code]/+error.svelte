<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>404 – Club Not Found</title>
</svelte:head>

<div class="container">
	<img src="https://hackclub.com/404/dinobox.svg" alt="Hack Club Dino" class="dino" />
	<h1 class="glitch" data-text="404!">404!</h1>
	<span class="message">We couldn't find that club.</span>
	<a href="https://hackclub.com" class="button">
		<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="home" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="32" height="32">
			<path d="M16,5c-0.358,0 -0.736,0.149 -0.997,0.264c-0.297,0.13 -0.676,0.326 -1.077,0.555c-0.789,0.451 -1.798,1.102 -2.878,1.864c-2.149,1.518 -4.715,3.572 -6.755,5.61c-0.391,0.39 -0.391,1.024 0,1.414c0.39,0.391 1.024,0.391 1.414,0c1.96,-1.962 4.394,-3.908 6.495,-5.39c1.045,-0.738 1.974,-1.337 2.716,-1.761c0.365,-0.209 0.649,-0.357 0.887,-0.46c0.091,-0.04 0.154,-0.064 0.195,-0.078c0.041,0.014 0.104,0.038 0.194,0.078c0.239,0.103 0.523,0.251 0.888,0.46c0.742,0.424 1.671,1.023 2.716,1.761c2.101,1.482 4.535,3.428 6.495,5.39c0.39,0.391 1.024,0.391 1.414,0c0.391,-0.39 0.391,-1.024 0,-1.414c-2.04,-2.038 -4.606,-4.092 -6.755,-5.61c-1.08,-0.762 -2.089,-1.413 -2.878,-1.864c-0.401,-0.229 -0.78,-0.425 -1.077,-0.555c-0.262,-0.115 -0.639,-0.264 -0.997,-0.264Zm3.934,19.816c0.184,-0.028 0.358,-0.061 0.524,-0.098l0.014,-0.003c0.923,-0.2 1.291,-0.482 1.522,-0.79c0.292,-0.39 0.589,-1.123 0.774,-2.649l0.001,-0.003c0.165,-1.347 0.218,-3.047 0.229,-5.273c0.002,-0.552 0.45,-1 1.002,-1c0.552,0 1,0.448 0.998,1c-0.052,10.061 -1.005,11 -8.998,11c-7.993,0 -8.946,-0.939 -8.998,-11c-0.002,-0.552 0.446,-1 0.998,-1c0.552,0 1,0.448 1.002,1c0.011,2.226 0.064,3.926 0.229,5.273l0.001,0.003c0.185,1.526 0.482,2.259 0.774,2.649c0.231,0.308 0.599,0.59 1.523,0.79l0.013,0.003c0.166,0.037 0.34,0.07 0.524,0.098c-0.049,-0.788 -0.066,-1.718 -0.066,-2.816c0,-5.133 0.4,-6 4,-6c3.6,0 4,0.867 4,6c0,1.098 -0.017,2.028 -0.066,2.816Zm-2.015,0.16c0.062,-0.782 0.081,-1.74 0.081,-2.976c0,-1.258 -0.02,-2.159 -0.105,-2.87l0,-0.002c-0.081,-0.688 -0.196,-0.921 -0.228,-0.973c-0.001,-0.001 -0.001,-0.002 -0.001,-0.003c-0.002,-0.005 -0.007,-0.009 -0.012,-0.009c-0.019,-0.001 -0.042,-0.003 -0.073,-0.009c-0.004,-0.001 -0.009,-0.002 -0.012,-0.003c-0.338,-0.11 -0.751,-0.133 -1.568,-0.131l-0.002,0c-0.817,-0.002 -1.23,0.021 -1.568,0.131c-0.004,0.001 -0.008,0.002 -0.012,0.003c-0.031,0.006 -0.055,0.008 -0.073,0.009c-0.005,0 -0.01,0.004 -0.012,0.009c0,0.002 0,0.002 -0.001,0.003c-0.032,0.052 -0.147,0.285 -0.228,0.973l0,0.002c-0.085,0.711 -0.105,1.612 -0.105,2.87c0,1.236 0.019,2.194 0.08,2.976c0.569,0.018 1.204,0.024 1.92,0.024l0,0c0.715,0 1.35,-0.006 1.919,-0.024Z"></path>
		</svg>
		Go to hackclub.com
	</a>
</div>

<style>
	.container {
		max-width: 512px;
		width: 100%;
		margin: 0 auto;
		padding: 64px 16px;
		text-align: center;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #ffffff;
	}

	@media (min-width: 32em) {
		.container {
			max-width: 600px;
			padding: 128px 16px;
		}
	}

	.dino {
		font-size: 128px;
		text-align: center;
		height: 128px;
		max-width: 100%;
	}

	@media (min-width: 32em) {
		.dino {
			font-size: 256px;
			height: 256px;
		}
	}

	.glitch {
		font-family: "Phantom Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-weight: 700;
		line-height: 1;
		font-size: 64px;
		position: relative;
		display: inline-block;
		color: #1f2d3d;
		margin: 16px 0;
	}

	@media (min-width: 32em) {
		.glitch {
			font-size: 128px;
		}
	}

	.glitch::before,
	.glitch::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		color: #e0e6ed;
		background: #ffffff;
		overflow: hidden;
		clip: rect(0, 512px, 0, 0);
	}

	.glitch::after {
		left: 2px;
		text-shadow: -2px 0 #ec3750;
		animation: glitch-after 2s infinite steps(2, jump-end) alternate-reverse;
	}

	.glitch::before {
		left: -2px;
		text-shadow: -2px 0 #5bc0de;
		animation: glitch-before 4s infinite steps(2, jump-end) alternate-reverse;
	}

	@keyframes glitch-before {
		0% { clip: rect(57px, 9999px, 7px, 0); }
		5% { clip: rect(61px, 9999px, 22px, 0); }
		10% { clip: rect(34px, 9999px, 47px, 0); }
		15% { clip: rect(92px, 9999px, 40px, 0); }
		20% { clip: rect(6px, 9999px, 40px, 0); }
		25% { clip: rect(39px, 9999px, 46px, 0); }
		30% { clip: rect(33px, 9999px, 17px, 0); }
		35% { clip: rect(5px, 9999px, 17px, 0); }
		40% { clip: rect(40px, 9999px, 70px, 0); }
		45% { clip: rect(14px, 9999px, 34px, 0); }
		50% { clip: rect(26px, 9999px, 30px, 0); }
		55% { clip: rect(15px, 9999px, 100px, 0); }
		60% { clip: rect(10px, 9999px, 32px, 0); }
		65% { clip: rect(49px, 9999px, 61px, 0); }
		70% { clip: rect(61px, 9999px, 22px, 0); }
		75% { clip: rect(85px, 9999px, 36px, 0); }
		80% { clip: rect(38px, 9999px, 59px, 0); }
		85% { clip: rect(21px, 9999px, 88px, 0); }
		90% { clip: rect(46px, 9999px, 16px, 0); }
		95% { clip: rect(13px, 9999px, 35px, 0); }
		100% { clip: rect(75px, 9999px, 13px, 0); }
	}

	@keyframes glitch-after {
		0% { clip: rect(62px, 9999px, 68px, 0); }
		5% { clip: rect(45px, 9999px, 9px, 0); }
		10% { clip: rect(9px, 9999px, 76px, 0); }
		15% { clip: rect(89px, 9999px, 83px, 0); }
		20% { clip: rect(44px, 9999px, 8px, 0); }
		25% { clip: rect(59px, 9999px, 24px, 0); }
		30% { clip: rect(96px, 9999px, 51px, 0); }
		35% { clip: rect(38px, 9999px, 28px, 0); }
		40% { clip: rect(92px, 9999px, 1px, 0); }
		45% { clip: rect(63px, 9999px, 80px, 0); }
		50% { clip: rect(1px, 9999px, 49px, 0); }
		55% { clip: rect(7px, 9999px, 49px, 0); }
		60% { clip: rect(35px, 9999px, 16px, 0); }
		65% { clip: rect(93px, 9999px, 72px, 0); }
		70% { clip: rect(55px, 9999px, 52px, 0); }
		75% { clip: rect(58px, 9999px, 68px, 0); }
		80% { clip: rect(94px, 9999px, 95px, 0); }
		85% { clip: rect(81px, 9999px, 24px, 0); }
		90% { clip: rect(98px, 9999px, 12px, 0); }
		95% { clip: rect(2px, 9999px, 96px, 0); }
		100% { clip: rect(95px, 9999px, 47px, 0); }
	}

	.message {
		font-size: 20px;
		margin: 8px 0 32px;
		display: block;
		color: #8492a6;
	}

	@media (min-width: 32em) {
		.message {
			font-size: 24px;
			margin-top: 16px;
		}
	}

	.button {
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		text-decoration: none;
		padding: 8px 16px;
		color: #ffffff;
		background-image: radial-gradient(ellipse farthest-corner at top left, #ff8c37, #ec3750);
		border: 0;
		border-radius: 99999px;
		cursor: pointer;
		font-family: inherit;
		font-weight: 700;
		font-size: 20px;
		text-transform: uppercase;
		letter-spacing: 0.009em;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.125);
		transition: transform 0.125s ease-in-out, box-shadow 0.125s ease-in-out;
	}

	.button:hover,
	.button:focus {
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.0625), 0 8px 12px rgba(0, 0, 0, 0.125);
		transform: scale(1.0625);
	}

	.button svg {
		margin-left: -4px;
		margin-right: 8px;
	}
</style>
