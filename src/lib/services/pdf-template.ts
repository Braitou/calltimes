/**
 * Template HTML partagé pour la génération PDF
 * Utilisé par le service PDF et l'email service
 */

export interface CallSheetPDFData {
  id: string
  title: string
  date: string
  project_name: string
  locations: Array<{
    id: number
    name: string
    address: string
    notes: string
  }>
  important_contacts: Array<{
    id: number
    name: string
    role: string
    phone: string
    email: string
  }>
  schedule: Array<{
    id: number
    title: string
    time: string
  }>
  team: Array<{
    id: number
    name: string
    role: string
    department: string
    phone: string
    email: string
    call_time?: string
    on_set_time?: string
  }>
  notes: string
}

export function generateCallSheetHTML(callSheet: CallSheetPDFData): string {
  const formattedDate = new Date(callSheet.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Grouper l'équipe par département
  const teamByDepartment = callSheet.team.reduce((acc, member) => {
    const dept = member.department || 'Autres'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(member)
    return acc
  }, {} as Record<string, typeof callSheet.team>)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Sheet - ${callSheet.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a1a1a;
      background: white;
    }
    
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 12mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 15px;
    }
    
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #000;
      margin-bottom: 4px;
    }
    
    .date {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .section {
      margin-bottom: 18px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #374151;
      margin-bottom: 8px;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 3px;
    }
    
    .locations {
      display: grid;
      gap: 8px;
    }
    
    .location {
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      border-left: 3px solid #4ade80;
    }
    
    .location-name {
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
    }
    
    .location-address {
      color: #6b7280;
      font-size: 10px;
      margin-bottom: 2px;
    }
    
    .location-notes {
      color: #9ca3af;
      font-size: 9px;
      font-style: italic;
    }
    
    .contacts {
      display: grid;
      gap: 4px;
    }
    
    .contact {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: #f3f4f6;
      border-radius: 3px;
      font-size: 10px;
    }
    
    .contact-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .contact-name {
      font-weight: 600;
      color: #111827;
    }
    
    .contact-role {
      color: #6b7280;
      font-size: 9px;
    }
    
    .contact-details {
      color: #9ca3af;
      font-size: 9px;
    }
    
    .schedule {
      display: grid;
      gap: 3px;
    }
    
    .schedule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: #fef3c7;
      border-radius: 3px;
      border-left: 3px solid #f59e0b;
    }
    
    .schedule-title {
      font-weight: 600;
      color: #92400e;
      font-size: 10px;
    }
    
    .schedule-time {
      font-weight: 700;
      color: #92400e;
      font-size: 11px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .team {
      display: grid;
      gap: 12px;
    }
    
    .department {
      margin-bottom: 8px;
    }
    
    .department-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #374151;
      margin-bottom: 4px;
      padding: 3px 6px;
      background: #e5e7eb;
      border-radius: 3px;
      display: inline-block;
    }
    
    .team-members {
      display: grid;
      gap: 2px;
      margin-left: 8px;
    }
    
    .team-member {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 8px;
      background: #f9fafb;
      border-radius: 3px;
      font-size: 9px;
    }
    
    .member-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .member-name {
      font-weight: 600;
      color: #111827;
    }
    
    .member-role {
      color: #6b7280;
    }
    
    .member-contact {
      color: #9ca3af;
      font-size: 8px;
    }
    
    .notes {
      background: #f0f9ff;
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid #0ea5e9;
      font-size: 10px;
      line-height: 1.5;
      color: #0c4a6e;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page {
        margin: 0;
        padding: 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1 class="title">${callSheet.title}</h1>
      <p class="date">${formattedDate}</p>
    </div>
    
    ${callSheet.locations && callSheet.locations.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📍 Lieux de tournage</h2>
      <div class="locations">
        ${callSheet.locations.map(location => `
        <div class="location">
          <div class="location-name">${location.name}</div>
          <div class="location-address">${location.address}</div>
          ${location.notes ? `<div class="location-notes">${location.notes}</div>` : ''}
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${callSheet.important_contacts && callSheet.important_contacts.length > 0 ? `
    <div class="section">
      <h2 class="section-title">📞 Contacts importants</h2>
      <div class="contacts">
        ${callSheet.important_contacts.map(contact => `
        <div class="contact">
          <div class="contact-info">
            <span class="contact-name">${contact.name}</span>
            <span class="contact-role">${contact.role}</span>
          </div>
          <div class="contact-details">${contact.email} • ${contact.phone}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${callSheet.schedule && callSheet.schedule.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⏰ Planning</h2>
      <div class="schedule">
        ${callSheet.schedule.map(item => `
        <div class="schedule-item">
          <span class="schedule-title">${item.title}</span>
          <span class="schedule-time">${item.time}</span>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${callSheet.team && callSheet.team.length > 0 ? `
    <div class="section">
      <h2 class="section-title">👥 Crew Call</h2>
      <div class="team">
        ${Object.entries(teamByDepartment).map(([department, members]) => `
        <div class="department">
          <div class="department-title">${department}</div>
          <div class="team-members">
            ${members.map(member => `
            <div class="team-member">
              <div class="member-info">
                <span class="member-name">${member.name}</span>
                <span class="member-role">${member.role}</span>
              </div>
              <div class="member-contact">${member.email} • ${member.phone}</div>
            </div>
            `).join('')}
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${callSheet.notes ? `
    <div class="section">
      <h2 class="section-title">📝 Notes</h2>
      <div class="notes">
        ${callSheet.notes}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `
}
