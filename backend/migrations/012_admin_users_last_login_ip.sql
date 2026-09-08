-- Migration 012: Bổ sung trường last_login_ip cho admin_users phục vụ theo dõi máy trạm đăng nhập
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'admin_users' 
    AND COLUMN_NAME = 'last_login_ip'
);

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE admin_users ADD COLUMN last_login_ip VARCHAR(45) NULL AFTER last_login;', 
  'SELECT 1;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
