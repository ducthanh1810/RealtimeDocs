#!/bin/bash

# Đường dẫn tới file SQLite ban đầu
ORIGINAL_DB="/sql_app.db"

# Đường dẫn tới file SQLite backup
BACKUP_DB="/backup_db/backup_sql_app.db"

# Sao chép file ban đầu tới vị trí backup
cp -f $BACKUP_DB $ORIGINAL_DB

echo "Backup completed at $(date)" >> /backup_db/backup_log.txt
