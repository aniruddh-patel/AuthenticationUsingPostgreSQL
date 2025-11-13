import redis from "../Connections/RedisCacheDB.js";

export const globalRateLimiter = async(req,res,next) => {
    const limit = 10 
    const windowSeconds = 60
    try {
      const userId = req?.user?.user_id
      
      const key = `rate:${userId}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > limit) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message: `API limit reached. Please wait ${ttl} seconds before retrying.`,
        });
      }
      next();

    } catch (err) {
      console.error("Rate limiter error:", err);
      next();
    }

};
