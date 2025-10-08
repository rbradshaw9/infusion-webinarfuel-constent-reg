# Webinar Bridge Audit Checklist

Use this checklist to gather system information on both servers and paste outputs here.

## App/Web Server (mailwizz-tcfa)

- Node & NPM versions
  - node -v && npm -v
- Service status
  - systemctl status webinar-bridge --no-pager
- Open ports
  - ss -tulpen | grep -E ':3001|:80|:443'
- Web server vhosts
  - apache2ctl -S 2>/dev/null || httpd -S 2>/dev/null
- SSL certificates
  - ls -l /etc/letsencrypt/live/bridge.thecashflowacademy.com
- Cron jobs (cert renewals, etc.)
  - crontab -l
- Logs (system, web, app)
  - tail -n 200 /var/log/syslog | tail -n 50
  - tail -n 200 /var/log/apache2/error.log | tail -n 50
  - tail -n 200 /var/www/webinar-bridge/logs/*.log 2>/dev/null | tail -n 50
- Environment
  - cat /var/www/webinar-bridge/backend/.env

## Database Server (198.199.69.39)

- PostgreSQL version
  - psql --version
- Databases and roles
  - sudo -u postgres psql -c "\\l" | sed -n '1,80p'
  - sudo -u postgres psql -c "\\du" | sed -n '1,80p'
- Tables and counts
  - sudo -u postgres psql -d webinar_bridge -c "\\dt+" | sed -n '1,80p'
  - sudo -u postgres psql -d webinar_bridge -c "select count(*) as users from users; select count(*) as forms from forms;"
- Postgres config
  - sudo grep -E '^(listen_addresses|port)' /etc/postgresql/*/main/postgresql.conf
  - sudo sed -n '1,120p' /etc/postgresql/*/main/pg_hba.conf
- Connectivity and firewall
  - ss -tulpen | grep 5432
  - sudo ufw status
- Resource and disk
  - df -h
  - free -h
