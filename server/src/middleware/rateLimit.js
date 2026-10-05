const buckets = new Map();
export function loginRateLimit(req,res,next){
  const key = `${req.ip}:${String(req.body?.email||'').trim().toLowerCase()}`;
  const now=Date.now(); const item=buckets.get(key) || {count:0,reset:now+15*60*1000};
  if(now>item.reset){item.count=0;item.reset=now+15*60*1000;}
  item.count += 1; buckets.set(key,item);
  if(item.count>12) return res.status(429).json({message:'Too many login attempts. Please wait 15 minutes and try again.'});
  next();
}
