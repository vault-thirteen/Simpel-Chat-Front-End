package api

import (
	"encoding/json"

	jrm1 "github.com/vault-thirteen/JSON-RPC-M1"
)

type ApiRequest struct {
	Action     string          `json:"action"`
	Parameters json.RawMessage `json:"parameters"`
}

type ApiResponse struct {
	Action string         `json:"action"`
	Result any            `json:"result"`
	Error  *jrm1.RpcError `json:"error"`
}
