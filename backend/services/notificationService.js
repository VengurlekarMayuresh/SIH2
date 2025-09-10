const nodemailer = require('nodemailer');
const UserAlertPreference = require('../models/UserAlertPreference');

class NotificationService {
  constructor() {
    this.setupEmailTransporter();
  }

  // Setup email transporter (you can configure with your email service)
  setupEmailTransporter() {
    this.emailTransporter = nodemailer.createTransporter({
      // Gmail configuration (you can change to your preferred service)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  // Send alert to multiple users
  async sendAlertToUsers(alert, users) {
    const results = {
      email: { sent: 0, failed: 0 },
      sms: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0 }
    };

    for (const userPref of users) {
      if (!userPref.userId) continue;

      try {
        // Send email notification
        if (userPref.notificationMethods.email && userPref.userId.email) {
          try {
            await this.sendEmailAlert(alert, userPref.userId);
            results.email.sent++;
          } catch (error) {
            console.error('Email failed for user:', userPref.userId._id, error.message);
            results.email.failed++;
          }
        }

        // Send SMS notification
        if (userPref.notificationMethods.sms && userPref.userId.phone) {
          try {
            await this.sendSMSAlert(alert, userPref.userId);
            results.sms.sent++;
          } catch (error) {
            console.error('SMS failed for user:', userPref.userId._id, error.message);
            results.sms.failed++;
          }
        }

        // Send push notification
        if (userPref.notificationMethods.push && userPref.userId.pushTokens) {
          try {
            await this.sendPushAlert(alert, userPref.userId);
            results.push.sent++;
          } catch (error) {
            console.error('Push notification failed for user:', userPref.userId._id, error.message);
            results.push.failed++;
          }
        }

      } catch (error) {
        console.error('Error sending alert to user:', userPref.userId._id, error);
      }
    }

    return results;
  }

  // Send email alert
  async sendEmailAlert(alert, user) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'alerts@safeed.com',
      to: user.email,
      subject: `🚨 ${alert.severity} Alert: ${alert.title}`,
      html: this.generateEmailHTML(alert, user)
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email}:`, result.messageId);
    return result;
  }

  // Generate HTML content for email alerts
  generateEmailHTML(alert, user) {
    const severityColor = this.getSeverityColor(alert.severity);
    const typeIcon = this.getTypeIcon(alert.type);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset=\"utf-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>Emergency Alert</title>
      </head>
      <body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;\">
        <div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">
          
          <!-- Header -->
          <div style=\"background-color: ${severityColor}; color: white; padding: 20px; text-align: center;\">
            <h1 style=\"margin: 0; font-size: 24px; font-weight: bold;\">
              ${typeIcon} ${alert.severity.toUpperCase()} ALERT
            </h1>
            <p style=\"margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">
              ${alert.source} • ${new Date(alert.startTime).toLocaleString()}
            </p>
          </div>

          <!-- Content -->
          <div style=\"padding: 30px;\">
            <h2 style=\"color: #333; margin: 0 0 15px 0; font-size: 22px;\">
              ${alert.title}
            </h2>
            
            <p style=\"color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;\">
              ${alert.description}
            </p>

            ${alert.location && (alert.location.city || alert.location.state) ? `
            <div style=\"background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;\">
              <h3 style=\"margin: 0 0 10px 0; color: #333; font-size: 16px;\">📍 Affected Area:</h3>
              <p style=\"margin: 0; color: #666;\">
                ${alert.location.city ? alert.location.city + ', ' : ''}
                ${alert.location.state || ''}
              </p>
            </div>
            ` : ''}

            ${alert.instructions && alert.instructions.length > 0 ? `
            <div style=\"background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"margin: 0 0 10px 0; color: #856404; font-size: 16px;\">⚠️ Safety Instructions:</h3>
              <ul style=\"margin: 0; padding-left: 20px; color: #856404;\">
                ${alert.instructions.map(instruction => `<li style=\"margin: 5px 0;\">${instruction}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${alert.contactInfo && alert.contactInfo.helplineNumber ? `
            <div style=\"background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 15px; margin: 20px 0;\">
              <h3 style=\"margin: 0 0 10px 0; color: #0c5460; font-size: 16px;\">📞 Emergency Contacts:</h3>
              <p style=\"margin: 0; color: #0c5460; font-weight: bold; font-size: 18px;\">
                NDMA Helpline: ${alert.contactInfo.helplineNumber}
              </p>
              <p style=\"margin: 5px 0 0 0; color: #0c5460;\">
                Emergency: 112
              </p>
            </div>
            ` : ''}

            <div style=\"text-align: center; margin: 30px 0;\">
              <a href=\"http://localhost:8080/dashboard\" 
                 style=\"display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;\">
                View Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style=\"background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;\">
            <p style=\"margin: 0; color: #6c757d; font-size: 14px;\">
              You received this alert because you subscribed to SafeEd emergency notifications.
            </p>
            <p style=\"margin: 10px 0 0 0; color: #6c757d; font-size: 12px;\">
              To manage your alert preferences, visit your dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send SMS alert (placeholder - integrate with SMS service like Twilio)
  async sendSMSAlert(alert, user) {
    // This is a placeholder. In production, integrate with SMS services like:
    // - Twilio
    // - AWS SNS
    // - TextLocal (India)
    // - MSG91 (India)
    
    const message = `🚨 ${alert.severity} ALERT: ${alert.title}\n\n${alert.description}\n\nFor more info: http://localhost:8080/dashboard\n\nEmergency: 112`;
    
    console.log(`SMS would be sent to ${user.phone}:`, message);
    
    // Example Twilio integration (uncomment and configure):
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    
    return await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: user.phone
    });
    */
    
    // For demo, simulate successful send
    return { sid: 'demo_sms_' + Date.now() };
  }

  // Send push notification (placeholder - integrate with Firebase or similar)
  async sendPushAlert(alert, user) {
    // This is a placeholder. In production, integrate with push services like:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNS)
    // - OneSignal
    
    const notification = {
      title: `🚨 ${alert.severity} Alert`,
      body: alert.title,
      data: {
        alertId: alert.alertId,
        severity: alert.severity,
        type: alert.type,
        url: '/dashboard'
      }
    };
    
    console.log(`Push notification would be sent to user ${user._id}:`, notification);
    
    // Example Firebase FCM integration (uncomment and configure):
    /*
    const admin = require('firebase-admin');
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data,
      tokens: user.pushTokens // Array of FCM tokens
    };
    
    return await admin.messaging().sendMulticast(message);
    */
    
    // For demo, simulate successful send
    return { successCount: 1, failureCount: 0 };
  }

  // Get color for severity level
  getSeverityColor(severity) {
    switch (severity.toLowerCase()) {
      case 'extreme': return '#dc3545'; // Red
      case 'severe': return '#fd7e14';  // Orange
      case 'moderate': return '#ffc107'; // Yellow
      case 'low': return '#28a745';     // Green
      default: return '#6c757d';        // Gray
    }
  }

  // Get icon for alert type
  getTypeIcon(type) {
    switch (type) {
      case 'cyclone': return '🌪️';
      case 'earthquake': return '🫨';
      case 'tsunami': return '🌊';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'heat_wave': return '🌡️';
      case 'cold_wave': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'heavy_rain': return '🌧️';
      case 'landslide': return '⛰️';
      default: return '⚠️';
    }
  }

  // Process new alert and send notifications
  async processAlertNotification(alert) {
    try {
      console.log(`Processing notifications for alert: ${alert.title}`);

      // Find users who should receive this alert
      const eligibleUsers = await UserAlertPreference.getUsersForAlert(alert);
      
      if (eligibleUsers.length === 0) {
        console.log('No eligible users found for this alert');
        return { sent: 0, users: [] };
      }

      console.log(`Found ${eligibleUsers.length} eligible users for alert notification`);

      // Send notifications
      const results = await this.sendAlertToUsers(alert, eligibleUsers);

      console.log('Alert notification results:', results);
      
      return {
        sent: eligibleUsers.length,
        users: eligibleUsers.map(u => u.userId._id),
        results
      };

    } catch (error) {
      console.error('Error processing alert notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
