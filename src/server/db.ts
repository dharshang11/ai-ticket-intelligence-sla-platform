import fs from 'fs';
import path from 'path';
import {
  User,
  Ticket,
  TicketAnalysis,
  SlaTracking,
  RiskPrediction,
  Assignment,
  AuditLog,
  Notification,
  RichTicket,
  TicketStatus,
  UserRole,
  UserStatus,
  TicketSource,
  TicketCategory
} from '../types.js';

interface DatabaseSchema {
  users: User[];
  tickets: Ticket[];
  ticket_analysis: TicketAnalysis[];
  sla_tracking: SlaTracking[];
  risk_predictions: RiskPrediction[];
  assignments: Assignment[];
  notifications: Notification[];
  audit_logs: AuditLog[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
function initializeDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    console.log('Database initialized and seeded successfully.');
  }
}

// Read database
export function readDb(): DatabaseSchema {
  initializeDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, returning seed data:', err);
    return getSeedData();
  }
}

// Write database
export function writeDb(data: DatabaseSchema) {
  initializeDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// SEED DATA FOR PRODUCTION QUALITY LOOK-AND-FEEL
function getSeedData(): DatabaseSchema {
  const now = new Date();
  
  // Create 4 initial users
  const users: User[] = [
    {
      id: 'u1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@enterprise-core.com',
      role: 'lead',
      status: 'active',
      skills: ['Security', 'Cloud', 'Infrastructure'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      id: 'u2',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@enterprise-core.com',
      role: 'member',
      status: 'active',
      skills: ['Database', 'Performance', 'Application'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      id: 'u3',
      name: 'Priya Patel',
      email: 'priya.patel@enterprise-core.com',
      role: 'member',
      status: 'active',
      skills: ['Network', 'Security', 'Authentication'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    },
    {
      id: 'u4',
      name: 'John Doe',
      email: 'john.doe@enterprise-core.com',
      role: 'member',
      status: 'active',
      skills: ['Application', 'Cloud', 'Infrastructure', 'Other'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    {
      id: 'u5',
      name: 'Alex Rivera',
      email: 'alex.rivera@enterprise-core.com',
      role: 'member',
      status: 'inactive',
      skills: ['Infrastructure', 'Performance'],
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
    }
  ];

  // Define some hours subtraction to create historical tickets
  const timeMinus = (hours: number) => {
    const t = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return t.toISOString();
  };

  const tickets: Ticket[] = [
    // T1: P1 Database Crash (Critical Risk) - In Progress, assigned to Rahul
    {
      id: 'T1001',
      subject: 'CRITICAL: Production DB Master Node is unresponsive - Out of Disk Space',
      body: 'Our automatic alert has triggered. The master database node pg-db-01 is experiencing 100% disk usage on /var/log/postgresql, causing connection failures for all API client services. Application is returning 500 server errors on core services.',
      sender: 'nagios-alerts@enterprise-core.com',
      source: 'gmail',
      status: 'in_progress',
      created_at: timeMinus(2), // 2 hours ago
      updated_at: timeMinus(1)
    },
    // T2: P2 Security Vulnerability - Open, assigned to Priya
    {
      id: 'T1002',
      subject: 'Urgent: Suspicious auth requests detected from foreign subnet',
      body: 'Our SIEM system noticed an unusual spike (over 450 authentication attempts per minute) from IP subnet 198.51.100.0/24 trying to access internal API server accounts. Need database logs review and block rule implementation ASAP.',
      sender: 'siem-security@enterprise-core.com',
      source: 'gmail',
      status: 'open',
      created_at: timeMinus(4), // 4 hours ago
      updated_at: timeMinus(4)
    },
    // T3: P3 Slack Ingesting Delay - Resolved by John
    {
      id: 'T1003',
      subject: 'Slack connection Webhook timeout warning',
      body: 'Users are reporting that real-time Slack notifications are failing to post. Looks like a DNS query latency issue when communicating with cellular webhook endpoints.',
      sender: 'alerts@slack-corp.com',
      source: 'outlook',
      status: 'resolved',
      created_at: timeMinus(12), // 12 hours ago
      updated_at: timeMinus(9)
    },
    // T4: P4 Documentation Update - Closed by Sarah
    {
      id: 'T1004',
      subject: 'Need system network topology diagram update',
      body: 'Please refresh the infrastructure draw.io blueprint to reflect the newly provisioned isolated subnets in our US-East region for SLA compliance audits.',
      sender: 'regulatory-compliance@enterprise-core.com',
      source: 'manual',
      status: 'closed',
      created_at: timeMinus(48), // 2 days ago
      updated_at: timeMinus(36)
    },
    // T5: P1 Network Down (Near SLA breach) - In Progress, assigned to Priya
    {
      id: 'T1005',
      subject: 'High Latency / SLA Breach Risk on Asia South Gateway',
      body: 'BGP routing instability has caused massive package drop rate on the main corporate VPN tunnel connected to the Bangalore engineering center. Communication with remote developers is completely hindered.',
      sender: 'networks-noc@enterprise-core.com',
      source: 'gmail',
      status: 'in_progress',
      created_at: timeMinus(3.6), // 3.6 hours ago (Critical P1 SLA is 4h!)
      updated_at: timeMinus(3.6)
    },
    // T6: P2 Cloud Resource Failure - Open, unassigned
    {
      id: 'T1006',
      subject: 'Kubernetes Pod CrashLoopBackOff: auth-api-service',
      body: 'Kubernetes deployment auth-api-service pod keeps restarting. Container logs indicate memory leak / Out of Memory killing. Need pod resource limit expansion in production cluster specs.',
      sender: 'kubernetes-noc@enterprise-core.com',
      source: 'outlook',
      status: 'open',
      created_at: timeMinus(1.5),
      updated_at: timeMinus(1.5)
    },
    // T7: P3 Authentication Failure - Resolved by Priya
    {
      id: 'T1007',
      subject: 'OAuth login loop for standard customer portal',
      body: 'We are receiving multiples tickets from corporate customers saying that they get redirected back to login screen continuously when entering OAuth callback URL. Cookies mismatch might be the cause after the latest TLS certificate upgrade.',
      sender: 'customer-support@retailer_ext.com',
      source: 'csv',
      status: 'resolved',
      created_at: timeMinus(22), // 22 hours ago
      updated_at: timeMinus(16)
    }
  ];

  const ticket_analysis: TicketAnalysis[] = [
    {
      ticket_id: 'T1001',
      category: 'Database',
      complexity: 5,
      priority: 'P1',
      business_impact: 'High',
      recommendation: 'Increase disk size of master node root partition and truncate pg_wal or clear bloated postgresql log files immediately to restore service.'
    },
    {
      ticket_id: 'T1002',
      category: 'Security',
      complexity: 4,
      priority: 'P2',
      business_impact: 'High',
      recommendation: 'Deploy dynamic ingress IP block rule on cloud firewall to counter 198.51.100.0/24 access. Audit affected API keys.'
    },
    {
      ticket_id: 'T1003',
      category: 'Application',
      complexity: 2,
      priority: 'P3',
      business_impact: 'Medium',
      recommendation: 'Modify dns_resolver timeout configs in slack webhook dispatcher engine and add background retry queue.'
    },
    {
      ticket_id: 'T1004',
      category: 'Infrastructure',
      complexity: 1,
      priority: 'P4',
      business_impact: 'Low',
      recommendation: 'Retrieve network layout changes from Cloud Formation logs and update the static Atlassian Confluence documentation page.'
    },
    {
      ticket_id: 'T1005',
      category: 'Network',
      complexity: 4,
      priority: 'P1',
      business_impact: 'High',
      recommendation: 'Reroute local transit VPN tunnels traffic temporarily over back up link (Asia West) while ISP fixes BGP handshake config.'
    },
    {
      ticket_id: 'T1006',
      category: 'Cloud',
      complexity: 3,
      priority: 'P2',
      business_impact: 'Medium',
      recommendation: 'Expand default Kubernetes RAM memory limits allocation in patch commit and test the container garbage disposal speed.'
    },
    {
      ticket_id: 'T1007',
      category: 'Authentication',
      complexity: 2,
      priority: 'P3',
      business_impact: 'High',
      recommendation: 'Set correct Secure and SameSite flags in application OAuth cookies configs to match new secure HTTPS configurations.'
    }
  ];

  // SLA Durations: P1 = 4h, P2 = 8h, P3 = 24h, P4 = 48h
  const calculateDeadline = (createdStr: string, priority: string) => {
    const created = new Date(createdStr);
    let hours = 24;
    if (priority === 'P1') hours = 4;
    else if (priority === 'P2') hours = 8;
    else if (priority === 'P3') hours = 24;
    else if (priority === 'P4') hours = 48;
    return new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();
  };

  const sla_tracking: SlaTracking[] = [
    {
      ticket_id: 'T1001',
      deadline: calculateDeadline(tickets[0].created_at, 'P1'),
      duration_hours: 4,
      remaining_minutes: 120, // 2 hours remaining
      is_breached: false
    },
    {
      ticket_id: 'T1002',
      deadline: calculateDeadline(tickets[1].created_at, 'P2'),
      duration_hours: 8,
      remaining_minutes: 240, // 4 hours remaining
      is_breached: false
    },
    {
      ticket_id: 'T1003',
      deadline: calculateDeadline(tickets[2].created_at, 'P3'),
      duration_hours: 24,
      remaining_minutes: 720,
      is_breached: false
    },
    {
      ticket_id: 'T1004',
      deadline: calculateDeadline(tickets[3].created_at, 'P4'),
      duration_hours: 48,
      remaining_minutes: 2160,
      is_breached: false
    },
    {
      ticket_id: 'T1005',
      deadline: calculateDeadline(tickets[4].created_at, 'P1'),
      duration_hours: 4,
      remaining_minutes: 24, // ONLY 24 minutes left! VERY critical!
      is_breached: false
    },
    {
      ticket_id: 'T1006',
      deadline: calculateDeadline(tickets[5].created_at, 'P2'),
      duration_hours: 8,
      remaining_minutes: 390,
      is_breached: false
    },
    {
      ticket_id: 'T1007',
      deadline: calculateDeadline(tickets[6].created_at, 'P3'),
      duration_hours: 24,
      remaining_minutes: 120,
      is_breached: false
    }
  ];

  const risk_predictions: RiskPrediction[] = [
    {
      ticket_id: 'T1001',
      risk_score: 85,
      risk_level: 'Critical',
      factors: ['Extreme ticket complexity (5/5)', 'P1 High Urgency', 'Remaining Time < 2 Hours']
    },
    {
      ticket_id: 'T1002',
      risk_score: 48,
      risk_level: 'Medium',
      factors: ['Medium network complexity (4/5)', 'Sufficient SLA cushion (> 4 Hours remaining)']
    },
    {
      ticket_id: 'T1003',
      risk_score: 15,
      risk_level: 'Low',
      factors: ['Resolved state', 'Simple application issue']
    },
    {
      ticket_id: 'T1004',
      risk_score: 5,
      risk_level: 'Low',
      factors: ['Closed state', 'Documentation simple task', 'Generous SLA cushion']
    },
    {
      ticket_id: 'T1005',
      risk_score: 96,
      risk_level: 'Critical',
      factors: ['SLA Breach Imminent (< 30 Minutes remaining)', 'High complexity network anomaly', 'High Business Impact']
    },
    {
      ticket_id: 'T1006',
      risk_score: 35,
      risk_level: 'Medium',
      factors: ['Moderate cloud complexity', 'Unassigned ticket', 'Moderate Business Impact']
    },
    {
      ticket_id: 'T1007',
      risk_score: 10,
      risk_level: 'Low',
      factors: ['Resolved state', 'High Business Impact fully addressed']
    }
  ];

  const assignments: Assignment[] = [
    {
      ticket_id: 'T1001',
      assigned_user_id: 'u2', // Rahul
      assigned_at: timeMinus(1.8),
      assigned_by: 'system'
    },
    {
      ticket_id: 'T1002',
      assigned_user_id: 'u3', // Priya
      assigned_at: timeMinus(3.8),
      assigned_by: 'system'
    },
    {
      ticket_id: 'T1003',
      assigned_user_id: 'u4', // John
      assigned_at: timeMinus(11.5),
      assigned_by: 'system'
    },
    {
      ticket_id: 'T1004',
      assigned_user_id: 'u1', // Sarah Lead
      assigned_at: timeMinus(47.5),
      assigned_by: 'lead'
    },
    {
      ticket_id: 'T1005',
      assigned_user_id: 'u3', // Priya
      assigned_at: timeMinus(3.5),
      assigned_by: 'system'
    },
    {
      ticket_id: 'T1006',
      assigned_user_id: null, // Unassigned
      assigned_at: '',
      assigned_by: 'system'
    },
    {
      ticket_id: 'T1007',
      assigned_user_id: 'u3', // Priya
      assigned_at: timeMinus(21.5),
      assigned_by: 'system'
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'n1',
      ticket_id: 'T1001',
      type: 'critical_created',
      message: '🚨 CRITICAL INCIDENT Created: Production DB Master Node is unresponsive - Out of Disk Space. Assigned to Rahul Sharma.',
      sent_at: timeMinus(2),
      channel: 'both',
      delivered: true
    },
    {
      id: 'n2',
      ticket_id: 'T1005',
      type: 'near_breach',
      message: '⚠️ NEAR BREACH ALERT: High Latency / SLA Breach Risk on Asia South Gateway has < 30 Minutes remaining! Assigned to Priya Patel.',
      sent_at: timeMinus(0.5),
      channel: 'both',
      delivered: true
    }
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'log1',
      ticket_id: 'T1001',
      user_id: null,
      user_name: 'AI Ingestion Service',
      action: 'INGESTED',
      description: 'Ingested ticket automatically from Gmail alert mailbox.',
      created_at: timeMinus(2)
    },
    {
      id: 'log2',
      ticket_id: 'T1001',
      user_id: null,
      user_name: 'AI Smart Assignment Engine',
      action: 'AUTO_ASSIGNED',
      description: 'System identified Rahul Sharma as highest probability resolver (Db skills, low workload).',
      created_at: timeMinus(1.8)
    },
    {
      id: 'log3',
      ticket_id: 'T1001',
      user_id: 'u2',
      user_name: 'Rahul Sharma',
      action: 'WORK_STARTED',
      description: 'Standard worker Rahul acknowledged the notification and set status to In Progress.',
      created_at: timeMinus(1)
    },
    {
      id: 'log4',
      ticket_id: 'T1005',
      user_id: null,
      user_name: 'AI Smart Assignment Engine',
      action: 'AUTO_ASSIGNED',
      description: 'High priority system network failure routing completed to Priya Patel.',
      created_at: timeMinus(3.5)
    }
  ];

  return {
    users,
    tickets,
    ticket_analysis,
    sla_tracking,
    risk_predictions,
    assignments,
    notifications,
    audit_logs
  };
}

// Data Utility Methods
export function getUsers(): User[] {
  const db = readDb();
  // Compute active tickets count live
  return db.users.map(u => {
    const activeCount = db.tickets.filter(t => {
      const isAssigned = db.assignments.find(a => a.ticket_id === t.id)?.assigned_user_id === u.id;
      const isPending = t.status === 'open' || t.status === 'in_progress';
      return isAssigned && isPending;
    }).length;
    return { ...u, active_tickets_count: activeCount };
  });
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}

export function createUser(user: Omit<User, 'id'>): User {
  const db = readDb();
  const id = 'u' + (db.users.length + 1) + Math.random().toString(36).substring(2, 5);
  const newUser: User = { ...user, id };
  db.users.push(newUser);
  writeDb(db);
  
  // Create audit log
  const audit: AuditLog = {
    id: 'log_usr_' + Math.random().toString(36).substring(2, 9),
    ticket_id: '',
    user_id: null,
    user_name: 'Administrator',
    action: 'USER_CREATED',
    description: `Created new team member: ${user.name} (${user.role}) - Skills: ${user.skills.join(', ')}`,
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(audit);
  writeDb(db);

  return newUser;
}

export function updateUserStatus(userId: string, status: UserStatus) {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.status = status;
    writeDb(db);
  }
}

export function getTickets(): Ticket[] {
  return readDb().tickets;
}

export function getRichTickets(): RichTicket[] {
  const db = readDb();
  const usersList = getUsers();

  return db.tickets.map(t => {
    const analysis = db.ticket_analysis.find(a => a.ticket_id === t.id) || {
      ticket_id: t.id,
      category: 'Other' as TicketCategory,
      complexity: 3,
      priority: 'P3' as const,
      business_impact: 'Medium' as const,
      recommendation: 'Needs manual analysis.'
    };
    
    const sla = db.sla_tracking.find(s => s.ticket_id === t.id) || {
      ticket_id: t.id,
      deadline: new Date(new Date(t.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      duration_hours: 24,
      remaining_minutes: 1440,
      is_breached: false
    };

    const risk = db.risk_predictions.find(r => r.ticket_id === t.id) || {
      ticket_id: t.id,
      risk_score: 30,
      risk_level: 'Low' as const,
      factors: ['Default low risk predicted.']
    };

    const assignment = db.assignments.find(a => a.ticket_id === t.id) || {
      ticket_id: t.id,
      assigned_user_id: null,
      assigned_at: '',
      assigned_by: 'system' as const
    };

    const assigned_user = assignment.assigned_user_id 
      ? usersList.find(u => u.id === assignment.assigned_user_id) || null
      : null;

    return {
      ticket: t,
      analysis,
      sla,
      risk,
      assignment,
      assigned_user
    };
  });
}

export function getRichTicketById(id: string): RichTicket | undefined {
  return getRichTickets().find(rt => rt.ticket.id === id);
}

export function createNewTicketRaw(ticket: Ticket, analysis: TicketAnalysis, sla: SlaTracking, risk: RiskPrediction, assignment: Assignment) {
  const db = readDb();
  db.tickets.push(ticket);
  db.ticket_analysis.push(analysis);
  db.sla_tracking.push(sla);
  db.risk_predictions.push(risk);
  db.assignments.push(assignment);
  writeDb(db);
}

export function updateTicketStatus(ticketId: string, status: TicketStatus, userId: string | null, userName: string) {
  const db = readDb();
  const ticket = db.tickets.find(t => t.id === ticketId);
  if (ticket) {
    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();

    // Create Audit Log
    const log: AuditLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      ticket_id: ticketId,
      user_id: userId,
      user_name: userName,
      action: 'STATUS_CHANGED',
      description: `Changed status from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
      created_at: new Date().toISOString()
    };
    db.audit_logs.push(log);
    writeDb(db);
  }
}

export function reassignTicket(ticketId: string, newUserId: string | null, assignerId: string, assignerName: string) {
  const db = readDb();
  let assignment = db.assignments.find(a => a.ticket_id === ticketId);
  
  const newUser = db.users.find(u => u.id === newUserId);
  const oldUserId = assignment?.assigned_user_id;
  const oldUser = oldUserId ? db.users.find(u => u.id === oldUserId) : null;
  
  if (!assignment) {
    assignment = {
      ticket_id: ticketId,
      assigned_user_id: newUserId,
      assigned_at: new Date().toISOString(),
      assigned_by: 'lead'
    };
    db.assignments.push(assignment);
  } else {
    assignment.assigned_user_id = newUserId;
    assignment.assigned_at = new Date().toISOString();
    assignment.assigned_by = 'lead';
  }

  // Create Audit Log
  const log: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 9),
    ticket_id: ticketId,
    user_id: assignerId,
    user_name: assignerName,
    action: 'REASSIGNED',
    description: `Reassigned ticket from ${oldUser ? oldUser.name : 'Unassigned'} to ${newUser ? newUser.name : 'Unassigned'}`,
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(log);
  writeDb(db);
}

export function getAuditLogs(): AuditLog[] {
  return readDb().audit_logs;
}

export function addAuditLog(ticketId: string, userId: string | null, userName: string, action: string, description: string) {
  const db = readDb();
  const log: AuditLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 9),
    ticket_id: ticketId,
    user_id: userId,
    user_name: userName,
    action,
    description,
    created_at: new Date().toISOString()
  };
  db.audit_logs.push(log);
  writeDb(db);
}

export function getNotifications(): Notification[] {
  return readDb().notifications;
}

export function addNotification(notification: Omit<Notification, 'id' | 'sent_at'>): Notification {
  const db = readDb();
  const newNotif: Notification = {
    ...notification,
    id: 'notif_' + Math.random().toString(36).substring(2, 9),
    sent_at: new Date().toISOString()
  };
  db.notifications.push(newNotif);
  writeDb(db);
  return newNotif;
}
