const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env) {
		// Handle preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		if (!key) {
			return new Response('Missing key', {
				status: 400,
				headers: corsHeaders,
			});
		}

		// GET
		if (request.method === 'GET') {
			const value = await env.STORE.get(key, { type: 'json' });
			return new Response(JSON.stringify(value), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
		}

		// POST
		if (request.method === 'POST') {
			const data = await request.json();
			await env.STORE.put(key, JSON.stringify(data));
			return new Response(JSON.stringify({ ok: true }), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
		}

		return new Response('Method not allowed', {
			status: 405,
			headers: corsHeaders,
		});
	},
};
