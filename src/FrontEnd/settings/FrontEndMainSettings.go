package settings

import (
	"github.com/vault-thirteen/auxie/errors"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

type FrontEndMainSettings struct {
	HostName             string `json:"hostName"`
	PortNumber           uint16 `json:"portNumber"`
	CertFile             string `json:"certFile"`
	KeyFile              string `json:"keyFile"`
	AssetsFolder         string `json:"assetsFolder"`
	HttpContentCacheTime int    `json:"httpContentCacheTime"`
}

func (s *FrontEndMainSettings) Validate() (err error) {
	if s == nil {
		return errors.ErrorFromText(helper.Err_NullPointer)
	}

	if len(s.HostName) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_HostName)
	}

	if s.PortNumber == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_PortNumber)
	}

	if len(s.CertFile) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_CertificateFile)
	}

	if len(s.KeyFile) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_KeyFile)
	}

	if len(s.AssetsFolder) == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_AssetsFolder)
	}

	if s.HttpContentCacheTime < 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_HttpCacheTime)
	}

	return nil
}
