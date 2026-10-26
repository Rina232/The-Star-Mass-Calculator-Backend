local result = {}
local keys = redis.call('KEYS', 'session:*')

for _, key in ipairs(keys) do
  local fields = redis.call('HMGET', key, 'userId', 'username')
  table.insert(result, cjson.encode({
    key = key,
    ttl = redis.call('TTL', key),
    userId = tonumber(fields[1]),
    username = fields[2] or cjson.null,
  }))
end

if #result == 0 then
  return { cjson.encode({ info = 'Активных сессий нет' }) }
end

return result
