package api

import (
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

type FrontEndVersionForFrontEnd struct {
	AppName    string `json:"appName"`
	AppVersion string `json:"appVersion"`
	GoVersion  string `json:"goVersion"`
}

func NewFrontEndVersionForFrontEnd(
	appName string,
	appVersion string,
	goVersion string,
) (fev *FrontEndVersionForFrontEnd, err error) {
	if len(appName) == 0 {
		return nil, helper.NewError_ParameterIsNotSet("application name")
	}
	if len(appVersion) == 0 {
		return nil, helper.NewError_ParameterIsNotSet("application version")
	}
	if len(goVersion) == 0 {
		return nil, helper.NewError_ParameterIsNotSet("go language version")
	}

	fev = &FrontEndVersionForFrontEnd{
		AppName:    appName,
		AppVersion: appVersion,
		GoVersion:  goVersion,
	}

	return fev, nil
}
