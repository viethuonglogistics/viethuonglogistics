-- Migration 013: Add quick_contact column to home_page table for floating contact buttons
SET @dbname = DATABASE();
SET @tablename = 'home_page';
SET @columnname = 'quick_contact';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE home_page ADD COLUMN quick_contact JSON NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Initialize default data for quick_contact if NULL
UPDATE home_page SET quick_contact = JSON_OBJECT(
  'enabled', true,
  'position', 'right',
  'pulse_animation', true,
  'title', 'Liên hệ nhanh',
  'items', JSON_ARRAY(
    JSON_OBJECT(
      'id', 'phone',
      'label', 'Hotline 24/7',
      'sublabel', '0905.386.888',
      'type', 'phone',
      'value', '0905386888',
      'color', '#b91c1c',
      'active', true
    ),
    JSON_OBJECT(
      'id', 'zalo',
      'label', 'Chat Zalo',
      'sublabel', 'Tư vấn ngay',
      'type', 'zalo',
      'value', 'https://id.zalo.me/account/login?continue=http%3A%2F%2Fzalo.me%2F0768406888',
      'color', '#0284c7',
      'active', true
    ),
    JSON_OBJECT(
      'id', 'messenger',
      'label', 'Facebook Messenger',
      'sublabel', 'Hỗ trợ trực tuyến',
      'type', 'messenger',
      'value', 'https://www.messenger.com/login.php?next=https%3A%2F%2Fwww.messenger.com%2Ft%2F106023084811174%2F%3Fmessaging_source%3Dsource%253Apages%253Amessage_shortlink%26source_id%3D1441792%26recurring_notification%3D0',
      'color', '#2563eb',
      'active', true
    ),
    JSON_OBJECT(
      'id', 'map',
      'label', 'Vị trí Google Map',
      'sublabel', 'Chỉ đường đến kho',
      'type', 'map',
      'value', 'https://www.google.com/maps/place/G%E1%BA%A0CH+%E1%BB%90P+L%C3%81T+%C4%90%C3%80+N%E1%BA%B4NG+-+VI%E1%BB%86T+H%C6%AF%C6%A0NG+CERAMICS+-+G%E1%BA%A0CH+%E1%BB%90P+L%C3%81T+NH%E1%BA%ACP+KH%E1%BA%A8U+CAO+C%E1%BA%A4P+%C4%90%C3%80+N%E1%BA%B4NG/@16.0822321,108.1918224,12z/data=!4m5!3m4!1s0x31421995f294dd55:0x9963a5bdc074290!8m2!3d16.0385806!4d108.2101752?shorturl=1',
      'color', '#059669',
      'active', true
    )
  )
) WHERE quick_contact IS NULL;
