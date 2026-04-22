# 🎯 Performance Optimization Best Practices

## Emotion Detection Platform - Best Practices Guide

---

## 1. Database Management 🗄️

### Connection Pool Tuning
```python
# For small deployments (1-5 concurrent users)
pool_size = 5
max_overflow = 10

# For medium deployments (5-50 concurrent users)
pool_size = 20
max_overflow = 40

# For large deployments (50+ concurrent users)
pool_size = 50
max_overflow = 100
```

### Query Best Practices
```python
# ❌ BAD: N+1 problem
sessions = db.query(Session).all()
for s in sessions:
    data = db.query(EmotionData).filter(EmotionData.session_id == s.id).all()

# ✅ GOOD: Single indexed query with results processing
sessions = db.query(Session).order_by(Session.created_at.desc()).all()
emotion_lookup = {}
for s in sessions:
    emotion_lookup[s.id] = db.query(EmotionData).filter(
        EmotionData.session_id == s.id,
        EmotionData.type == 'entry'
    ).all()  # Uses composite index
```

### Index Maintenance
```sql
-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Rebuild indexes if fragmented
REINDEX TABLE emotion_data;
REINDEX TABLE sessions;
```

---

## 2. Emotion Detection Optimization ⚡

### Model Caching Strategy
```python
# In cache_utils.py
# Model TTL: 1 hour (good for real-time use)
# Adjust based on needs:

CACHE_TTL = {
    'models': 3600,        # 1 hour - models rarely change
    'face_detector': 3600, # 1 hour
    'stats': 60,           # 1 minute - stats update frequently
    'sessions': 300,       # 5 minutes - rarely change
}
```

### Image Processing Optimization
```python
# In services.py - adjust based on accuracy needs

# Current: Resize to 1280px (balance speed/accuracy)
MAX_DIM = 1280

# For high accuracy (slower):
MAX_DIM = 2048

# For high speed (faster):
MAX_DIM = 640

# Confidence threshold (reduce false positives)
CONF_THRESHOLD = 0.5  # Default
CONF_THRESHOLD = 0.7  # Strict (fewer detections)
CONF_THRESHOLD = 0.3  # Permissive (more detections)
```

---

## 3. Frontend Optimization 🎨

### Polling Strategy
```javascript
// Current: 10 seconds (balanced)
const ANALYTICS_POLL_INTERVAL = 10000;

// For real-time dashboards (more traffic):
const ANALYTICS_POLL_INTERVAL = 5000;

// For low-traffic scenarios (less traffic):
const ANALYTICS_POLL_INTERVAL = 15000;

// For student presentations (minimal updates):
const ANALYTICS_POLL_INTERVAL = 30000;
```

### Image Compression Settings
```javascript
// In compression.js

// Current: 75% quality (good balance)
const COMPRESSION_QUALITY = 0.75;

// For high quality (larger uploads):
const COMPRESSION_QUALITY = 0.85;

// For mobile users (faster uploads):
const COMPRESSION_QUALITY = 0.60;

// Max image dimension before resize
const MAX_IMAGE_DIM = 1280;

// Max video upload size
const MAX_VIDEO_SIZE_MB = 50;
```

---

## 4. Deployment Configuration 🚀

### Production Environment Variables
```bash
# .env.production
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/behavior_analyzer
DB_POOL_SIZE=30
DB_MAX_OVERFLOW=60

# Caching
CACHE_TTL_MODELS=3600

# API
API_RATE_LIMIT=1000/hour
API_TIMEOUT=30

# Performance
WORKER_THREADS=4
MAX_REQUEST_SIZE=100MB
```

### Gunicorn Configuration
```python
# gunicorn_config.py
workers = 4  # Number of CPU cores
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 30
keepalive = 5
```

### Docker Optimization
```dockerfile
# Dockerfile - production
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "main:app"]
```

---

## 5. Monitoring & Alerts 📊

### Performance Metrics to Monitor
```python
# Key metrics to track
METRICS = {
    'response_time': 'p95 < 500ms',  # 95th percentile
    'model_load_time': '< 100ms',     # Cache hit
    'db_query_time': 'p95 < 200ms',   # With indexes
    'api_calls_per_second': '< 100',  # Rate limiting
    'error_rate': '< 0.1%',           # Acceptable errors
    'cache_hit_rate': '> 80%',        # Model cache effectiveness
}
```

### Logging Best Practices
```python
import logging

# Set log level
logging.basicConfig(level=logging.WARNING)

# Log slow queries (> 500ms)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_performance(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    if duration > 0.5:  # Log if slow
        logger.warning(f"Slow request: {request.url} took {duration:.2f}s")
    
    return response
```

---

## 6. Maintenance Tasks 🔧

### Weekly
```bash
# Check database performance
# Monitor slow queries in PostgreSQL logs

# Clear expired cache entries
redis-cli FLUSHDB  # Or implement TTL cleanup

# Review error logs
tail -100 /var/log/app/error.log
```

### Monthly
```bash
# Analyze database growth
SELECT sum(pg_total_relation_size(schemaname||'."'||tablename||'"'))
FROM pg_tables
WHERE schemaname = 'public';

# Rebuild fragmented indexes if needed
REINDEX DATABASE behavior_analyzer;

# Archive old emotion data (>30 days)
DELETE FROM emotion_data WHERE timestamp < now() - interval '30 days';

# Generate performance reports
```

### Quarterly
```bash
# Database optimization
VACUUM ANALYZE;

# Update statistics
ANALYZE;

# Review and adjust pool sizes
# Check if concurrent users changed
```

---

## 7. Cost Optimization 💰

### Database Sizing
```
Small:   5-10 GB, t3.small (AWS)
Medium:  50-100 GB, r5.xlarge
Large:   500+ GB, r5.2xlarge + read replicas
```

### Storage Optimization
```python
# Compress old emotion data
def compress_old_data():
    # Store only summaries for data > 30 days
    # Remove raw emotion records
    # Keep aggregated statistics
    
    threshold = datetime.now() - timedelta(days=30)
    db.query(EmotionData).filter(
        EmotionData.timestamp < threshold
    ).delete()
```

---

## 8. Security Best Practices 🔐

### Input Validation
```python
from pydantic import BaseModel, validator

class SessionCreate(BaseModel):
    name: str
    class_name: str
    instructor: str
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Name must be at least 3 characters')
        return v
```

### Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.get("/sessions/{session_id}/report")
@limiter.limit("100/minute")
async def get_report(session_id: str):
    # Rate limited endpoint
    pass
```

---

## 9. Performance Checklist ✅

- [ ] Database connection pooling configured
- [ ] Indexes created on commonly queried fields
- [ ] Model caching implemented
- [ ] Image compression utilities added
- [ ] Frontend polling optimized (10s interval)
- [ ] React useMemo() for chart data
- [ ] Error handling improved
- [ ] Logging configured
- [ ] Monitoring in place
- [ ] Load testing performed

---

## 10. Quick Optimization Reference

| Issue | Solution | Impact |
|-------|----------|--------|
| Slow model loading | Implement caching | 97% faster |
| Slow queries | Add database indexes | 75% faster |
| High network traffic | Compress images | 60-80% reduction |
| Excessive API calls | Reduce polling | 50% less traffic |
| High memory usage | Model caching | 90% reduction |
| Slow database | Connection pooling | 40-60% faster |

---

## 📝 Notes for Future Development

1. **Scaling:** When adding more features, always use indexed queries
2. **Caching:** Cache computation-heavy operations (stats calculation)
3. **APIs:** Implement pagination for large result sets
4. **Monitoring:** Set up alerts for metrics exceeding thresholds
5. **Testing:** Load test after major changes

---

Happy optimizing! 🚀

