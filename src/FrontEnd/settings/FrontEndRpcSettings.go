package settings

import (
	"github.com/vault-thirteen/auxie/errors"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

type FrontEndRpcSettings struct {
	ServerName                  string `json:"serverName"`
	PortNumber                  uint16 `json:"portNumber"`
	Schema                      string `json:"schema"`
	EnableSelfSignedCertificate bool   `json:"enableSelfSignedCertificate"`
	ApiPath                     string `json:"apiPath"`
}

func (s *FrontEndRpcSettings) Validate() (err error) {
	if s == nil {
		return errors.ErrorFromText(helper.Err_NullPointer)
	}

	if len(s.ServerName) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_ServerName)
	}

	if s.PortNumber == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_PortNumber)
	}

	if len(s.Schema) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_ServerSchema)
	}

	if len(s.ApiPath) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_ApiPath)
	}

	return nil
}
