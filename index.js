import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

// Initialize the Neon database connection
const createNeonConnection = (NEON_SECRET) => {
  if (!NEON_SECRET) {
    console.error('NEON_SECRET is not set');
    throw new Error('NEON_SECRET environment variable is not set');
  }
  return neon(NEON_SECRET);
};

const createDrizzleDb = (NEON_SECRET) => drizzle(createNeonConnection(NEON_SECRET));

export default {
  async fetch(request, env, ctx) {
    try {
      // Usa env.NEON_SECRET si está disponible, de lo contrario usa process.env.NEON_SECRET
      const NEON_SECRET = env && env.NEON_SECRET ? env.NEON_SECRET : process.env.NEON_SECRET;
      return await handleRequest(request, NEON_SECRET);
    } catch (error) {
      console.error('Fetch handler error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

async function handleRequest(request, NEON_SECRET) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  const parts = hostname.split('.');
  const subdomain = parts.length > 2 ? parts[0] : null;

  if (!subdomain) {
    return new Response('Invalid domain', { status: 400 });
  }

  try {
    const projectDetails = await getProjectDetails(subdomain, NEON_SECRET);

    if (projectDetails) {
      return new Response(projectDetails.html_content, {
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function getProjectDetails(subdomain, NEON_SECRET) {
  try {
    const db = createDrizzleDb(NEON_SECRET);
    const query = sql`SELECT html_content FROM project WHERE domain_name = ${subdomain}`;
    const result = await db.execute(query);

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}