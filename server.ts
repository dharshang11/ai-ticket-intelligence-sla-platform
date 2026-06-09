import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { 
  getUsers, 
  createUser, 
  updateUserStatus, 
  getRichTickets, 
  getRichTicketById, 
  createNewTicketRaw, 
  updateTicketStatus, 
  reassignTicket, 
  getAuditLogs, 
  addAuditLog, 
  getNotifications, 
  addNotification, 
  readDb, 
  writeDb 
} from './src/server/db.js';
import { analyzeTicketWithAI, generateExecutiveSummary, generatePersonalInsights } from './src/server/ai.js';
import { calculateSla, predictRisk, assignTicketAutomatically, runSlaAndRiskChecks } from './src/server/engines.js';
import { Ticket, TicketAnalysis, SlaTracking, RiskPrediction, Assignment, TicketSource } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// List of pre-defined realistic emails to simulate regular incoming emails via automated polling
const SIMULATED_INBOX_EMAILS = [
  {
    subject: 'SECURITY WARNING: API console authentication token exposed on public github repository',
    body: 'Automated scan detected that deep-integration-developer-key has been accidentally committed in cleartext to master branch of our public client sdk repository. We need immediate revocation of the secret, log checking, and SSH rotation across API servers.',
    sender: 'github-security-audit@enterprise-core.com',
    source: 'gmail' as TicketSource
  },
  {
    subject: 'Production Database vacuum fail - table bloat causing 100% CPU lock',
    body: 'The transactional database tables "order_line_items" has critical dead tuple bloating. Autovacuum is failing to acquire lock since yesterday, resulting in intensive sequential disk scans and locking up the core CPU cores.',
    sender: 'system-monitor@enterprise-core.com',
    source: 'gmail' as TicketSource
  },
  {
    subject: 'VPN Tunnel disconnected: corporate office to West Staging VPC',
    body: 'Continuous ping loss noticed on gateway IP 203.0.113.15. The IPsec tunnel is failing to complete Phase 2 negotiations. Main impact: Staging environment testing is currently down for all developers.',
    sender: 'networks-noc@enterprise-core.com',
    source: 'outlook' as TicketSource
  },
  {
    subject: 'SAML Authentication failure on Customer SSO bridge',
    body: 'SSO Federated login has stopped working for our major enterprise clients using Active Directory Federation. Customer assertions are rejected with error: audience mismatch (aud attribute verification failed).',
    sender: 'customer-identity-portal@external_b2b.com',
    source: 'gmail' as TicketSource
  },
  {
    subject: 'Major service drop - Web application load balancer returning high error rate 502',
    body: 'The public application load balancer has experienced a sudden traffic spike of requests. Current healthy instances set count is dropping. Latency has increased to over 12.4 seconds per page render.',
    sender: 'cloudflare-gateway@enterprise-core.com',
    source: 'outlook' as TicketSource
  }
];

let simulatedInboundIndex = 0;

// AUTOMATED EMAIL INGESTION CONTROLLER (called during ingestion, poll, or creation)
async function ingestEmail(email: { subject: string; body: string; sender: string; source: TicketSource }): Promise<string> {
  const db = readDb();
  
  // Clean custom ticket ID generator
  const lastIdNum = db.tickets.length > 0 
    ? Math.max(...db.tickets.map(t => parseInt(t.id.replace('T', '')) || 1000)) 
    : 1000;
  const newId = 'T' + (lastIdNum + 1);

  const newTicket: Ticket = {
    id: newId,
    subject: email.subject,
    body: email.body,
    sender: email.sender,
    source: email.source,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Run AI analysis
  const analysis: TicketAnalysis = await analyzeTicketWithAI({
    id: newId,
    subject: email.subject,
    body: email.body,
    sender: email.sender,
    source: email.source,
    status: 'open'
  });

  // 2. SLA Engine Calculation
  const sla: SlaTracking = calculateSla(newTicket.created_at, analysis.priority);
  sla.ticket_id = newId;

  // 3. Risk Prediction Score
  const risk: RiskPrediction = predictRisk(newTicket.status, sla.remaining_minutes, analysis.priority, analysis.complexity, analysis.business_impact);
  risk.ticket_id = newId;

  // 4. Smart Assignment Engine
  const assignment: Assignment = assignTicketAutomatically(newId, analysis.category, analysis.complexity);
  
  // Register everything to databases
  createNewTicketRaw(newTicket, analysis, sla, risk, assignment);

  // 5. Send alerts (Discord simulation and local notifications db log)
  const assignedUser = db.users.find(u => u.id === assignment.assigned_user_id);
  const assigneeName = assignedUser ? assignedUser.name : 'Unassigned';

  // Trigger 1: Critical Ticket Out-of-the-gate Alert
  if (analysis.priority === 'P1') {
    const message = `🚨 CRITICAL INCIDENT Created | Ticket: ${newId} | Category: ${analysis.category} | Priority: P1 | Risk Score: ${risk.risk_score}/100 | Assigned to ${assigneeName}. Recommendation: ${analysis.recommendation}`;
    addNotification({
      ticket_id: newId,
      type: 'critical_created',
      message,
      channel: 'both',
      delivered: true
    });
  } else if (risk.risk_score > 80) {
    const message = `🔥 EXTREME RISK ALERT | Ticket ${newId} (${analysis.priority}) created with high predicted risk score ${risk.risk_score}. Assigned: ${assigneeName}.`;
    addNotification({
      ticket_id: newId,
      type: 'high_risk',
      message,
      channel: 'both',
      delivered: true
    });
  } else {
    // Standard alert
    const message = `💡 Ticket ${newId} (${analysis.priority}) autoassigned to ${assigneeName}. Category: ${analysis.category}.`;
    addNotification({
      ticket_id: newId,
      type: 'standard_assigned',
      message,
      channel: 'in_app',
      delivered: true
    });
  }

  // Audit Log
  addAuditLog(
    newId,
    null,
    'AI Auto-Ingest Engine',
    'INGESTED_EMAIL',
    `Automatically ingested email from ${email.source.toUpperCase()} into Ticket ${newId} (${analysis.category}). Assigned to: ${assigneeName}.`
  );

  console.log(`Successfully ingested and auto-routed email into ticket ${newId} with category ${analysis.category}!`);
  return newId;
}

// Background poller interval (Runs every 5 minutes)
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setInterval(async () => {
  console.log('Automated 5-minute Gmail/Outlook Email Poll triggering...');
  if (simulatedInboundIndex < SIMULATED_INBOX_EMAILS.length) {
    const emailToIngest = SIMULATED_INBOX_EMAILS[simulatedInboundIndex];
    simulatedInboundIndex = (simulatedInboundIndex + 1) % SIMULATED_INBOX_EMAILS.length;
    await ingestEmail(emailToIngest);
  }
  // Periodically check remaining SLA minutes for current open tickets
  runSlaAndRiskChecks();
}, FIVE_MINUTES_MS);


// API ROUTING

// Endpoint: Trigger immediate simulated poll
app.post('/api/polling/trigger', async (req, res) => {
  try {
    const emailToIngest = SIMULATED_INBOX_EMAILS[simulatedInboundIndex];
    simulatedInboundIndex = (simulatedInboundIndex + 1) % SIMULATED_INBOX_EMAILS.length;
    
    console.log(`Manual trigger requested. Ingesting email from ${emailToIngest.sender}...`);
    const ticketId = await ingestEmail(emailToIngest);
    
    // Also run general SLA calculations update
    runSlaAndRiskChecks();

    res.json({
      success: true,
      message: `Triggered email sync successfully. New ticket generated: ${ticketId}`,
      ticket_id: ticketId
    });
  } catch (err: any) {
    console.error('Email syncing trigger error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Polling trigger failure.' });
  }
});

// Endpoint: Active poll triggers calculations updates
app.post('/api/sla-checks/run', (req, res) => {
  try {
    const result = runSlaAndRiskChecks();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Fetch all tickets with rich metrics parsed
app.get('/api/tickets', (req, res) => {
  try {
    // First, run dynamic recalculation of SLAs to ensure remaining times are perfectly precise
    runSlaAndRiskChecks();
    const tickets = getRichTickets();
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Fetch single rich ticket
app.get('/api/tickets/:id', (req, res) => {
  try {
    const t = getRichTicketById(req.params.id);
    if (!t) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found.' });
    }
    res.json(t);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Create a ticket manually (Manual or CSV upload)
app.post('/api/tickets', async (req, res) => {
  const { subject, body, sender, source } = req.body;
  if (!subject || !body || !sender) {
    return res.status(400).json({ status: 'error', message: 'Subject, body, and sender are required.' });
  }

  try {
    const ticketId = await ingestEmail({
      subject,
      body,
      sender,
      source: (source || 'manual') as TicketSource
    });
    
    const rt = getRichTicketById(ticketId);
    res.status(201).json(rt);
  } catch (err: any) {
    console.error('Error creating ticket manually:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Bulk upload CSV simulation
app.post('/api/tickets/bulk-csv', async (req, res) => {
  const { list } = req.body; // Array of { subject, body, sender }
  if (!Array.isArray(list) || list.length === 0) {
    return res.status(400).json({ status: 'error', message: 'A non-empty list of tickets is required.' });
  }

  try {
    const generatedIds: string[] = [];
    for (const item of list) {
      const ticketId = await ingestEmail({
        subject: item.subject,
        body: item.body,
        sender: item.sender || 'csv-upload@enterprise.com',
        source: 'csv'
      });
      generatedIds.push(ticketId);
    }
    res.json({ success: true, message: `Successfully bulk ingested ${generatedIds.length} tickets.`, ids: generatedIds });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Update ticket status (e.g. Open -> In Progress -> Resolved, etc.)
app.post('/api/tickets/:id/status', (req, res) => {
  const { status, user_id, user_name } = req.body;
  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Status field is required.' });
  }

  try {
    const currentTicket = getRichTicketById(req.params.id);
    if (!currentTicket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found.' });
    }

    // Role and permission constraint check: Only Team Lead can move Resolved -> Closed
    if (currentTicket.ticket.status === 'resolved' && status === 'closed') {
      const activeUser = getUsers().find(u => u.id === user_id);
      if (!activeUser || activeUser.role !== 'lead') {
        return res.status(403).json({ 
          status: 'error', 
          message: 'Security Constraint: Only Team Lead accounts possess authority to mark a Resolved ticket as Closed.' 
        });
      }
    }

    updateTicketStatus(req.params.id, status, user_id || null, user_name || 'System');
    
    // Trigger dynamic metrics update right after status change
    runSlaAndRiskChecks();

    const updated = getRichTicketById(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Reassign a ticket (Team Lead permission constraints)
app.post('/api/tickets/:id/reassign', (req, res) => {
  const { new_assigned_user_id, assigner_id, assigner_name } = req.body;
  
  try {
    const richTicket = getRichTicketById(req.params.id);
    if (!richTicket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found.' });
    }

    // Team lead check for reassigning other priority tickets
    const activeLead = getUsers().find(u => u.id === assigner_id);
    if (!activeLead) {
      return res.status(403).json({ status: 'error', message: 'Authorized sessions only.' });
    }

    // Leader reassign constraint: Team Lead can re-assign any ticket.
    // Team Members cannot re-assign.
    if (activeLead.role !== 'lead') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Identity Breach: Only enterprise Team Leads possess authority to override routing assignments.' 
      });
    }

    reassignTicket(req.params.id, new_assigned_user_id || null, assigner_id, assigner_name);
    
    // Recalculate
    runSlaAndRiskChecks();

    const updated = getRichTicketById(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Fetch users list
app.get('/api/users', (req, res) => {
  try {
    const users = getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Create a new user (Lead permission only)
app.post('/api/users', (req, res) => {
  const { name, email, role, skills, avatar, creator_id } = req.body;
  if (!name || !email || !role || !skills) {
    return res.status(400).json({ status: 'error', message: 'Name, email, role, and skills are required.' });
  }

  try {
    const creator = getUsers().find(u => u.id === creator_id);
    if (!creator || creator.role !== 'lead') {
      return res.status(403).json({ status: 'error', message: 'Security Breach: Only Team Leads can onboard new technicians.' });
    }

    const newUser = createUser({
      name,
      email,
      role,
      status: 'active',
      skills,
      avatar: avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150`
    });

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Update user status active/inactive (role-based)
app.post('/api/users/:id/status', (req, res) => {
  const { status, actor_id } = req.body;
  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Status is required.' });
  }

  try {
    const actor = getUsers().find(u => u.id === actor_id);
    if (!actor || actor.role !== 'lead') {
      return res.status(403).json({ status: 'error', message: 'Security Breach: Only Team Leads can deactivate staff.' });
    }

    updateUserStatus(req.params.id, status);
    res.json({ success: true, message: `Status of user ${req.params.id} updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Generate / Fetch Executive AI Management Summary
app.get('/api/summary', async (req, res) => {
  try {
    const tickets = getRichTickets();
    const summary = await generateExecutiveSummary(tickets);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Generate / Fetch engineer personal metrics coaching insight page
app.get('/api/insights/:engineer_name', async (req, res) => {
  try {
    const tickets = getRichTickets();
    const personalAssigned = tickets.filter(t => t.assigned_user?.name.toLowerCase() === req.params.engineer_name.toLowerCase());
    const insights = await generatePersonalInsights(req.params.engineer_name, personalAssigned);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Fetch Audit Logs
app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = getAuditLogs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint: Fetch Notifications logs
app.get('/api/notifications', (req, res) => {
  try {
    const alerts = getNotifications().sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// FRONTEND ASSETS INTEGRATION & VITE SETUP
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development dynamic imports (Vite loaded as middle-tier express server)
    console.log('Starting fullstack server in DEVELOPMENT mode with Vite Dynamic HMR...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static compiled build maps
    console.log('Starting fullstack server in PRODUCTION static payload distribution mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`============================================================`);
    console.log(`🚀 ENTERPRISE FULLSTACK SERVER IS LIVE AT: http://localhost:${PORT}`);
    console.log(`🛡️ Role-Based Access Controls, Smart SLA & AI Engines active.`);
    console.log(`📬 Pollers actively tracking Gmail & Outlook Mailboxes.`);
    console.log(`============================================================`);
  });
}

initializeServer().catch(err => {
  console.error('CRITICAL: Server initialization crashed:', err);
});
