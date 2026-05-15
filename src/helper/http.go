package helper

import (
	"net/http"
	"strconv"
	"time"

	"github.com/vault-thirteen/auxie/header"
)

func SetCacheTime(rw http.ResponseWriter, ttlSec int, timeNowUtc time.Time) {
	if ttlSec < 0 {
		return
	}

	// Legacy HTTP 1.0.
	exp := timeNowUtc.Add(time.Duration(ttlSec) * time.Second).Format(http.TimeFormat)
	rw.Header().Set(header.HttpHeaderExpires, exp)

	// Modern HTTP 1.1.
	cc := "max-age=" + strconv.Itoa(ttlSec)
	rw.Header().Set(header.HttpHeaderCacheControl, cc)
}
