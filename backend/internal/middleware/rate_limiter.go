package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter represents a simple rate limiter
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // requests per window
	window   time.Duration // time window
}

type visitor struct {
	limiter  chan time.Time
	lastSeen time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
	}
	
	// Clean up old visitors every minute
	go rl.cleanupVisitors()
	
	return rl
}

// Allow checks if a request should be allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	v, exists := rl.visitors[key]
	if !exists {
		v = &visitor{
			limiter: make(chan time.Time, rl.rate),
		}
		rl.visitors[key] = v
	}
	
	// Fill the limiter
	for i := len(v.limiter); i < rl.rate; i++ {
		v.limiter <- time.Now()
	}
	
	// Check if there's a token available
	select {
	case <-v.limiter:
		v.lastSeen = time.Now()
		return true
	default:
		return false
	}
}

// cleanupVisitors removes old visitors
func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(time.Minute)
		
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > 5*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimit creates a rate limiting middleware
func RateLimit(rate int, window time.Duration) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, window)
	
	return func(c *gin.Context) {
		key := c.ClientIP()
		
		if !limiter.Allow(key) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"retry_after": window.Seconds(),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// AuthRateLimit applies stricter rate limiting for auth endpoints
func AuthRateLimit() gin.HandlerFunc {
	// 5 requests per minute for auth endpoints
	return RateLimit(5, time.Minute)
}

// GeneralRateLimit applies general rate limiting
func GeneralRateLimit() gin.HandlerFunc {
	// 100 requests per minute for general endpoints
	return RateLimit(100, time.Minute)
}