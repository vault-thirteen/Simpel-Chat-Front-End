package api

import (
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

const (
	ParameterName_ApplicationName    = "application name"
	ParameterName_ApplicationVersion = "application version"
	ParameterName_GoLanguageVersion  = "go language version"
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
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_ApplicationName)
	}
	if len(appVersion) == 0 {
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_ApplicationVersion)
	}
	if len(goVersion) == 0 {
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_GoLanguageVersion)
	}

	fev = &FrontEndVersionForFrontEnd{
		AppName:    appName,
		AppVersion: appVersion,
		GoVersion:  goVersion,
	}

	return fev, nil
}
