package api

import (
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

const (
	ParameterName_MessageSizeLimit    = "message size limit"
	ParameterName_PasswordMinimumSize = "password minimum size"
	ParameterName_PasswordMaximumSize = "password maximum size"
)

type SettingsForFrontEnd struct {
	MessageSizeMax    int `json:"messageSizeMax"`
	PasswordLengthMin int `json:"passwordLengthMin"`
	PasswordLengthMax int `json:"passwordLengthMax"`
}

func NewSettingsForFrontEnd(
	messageSizeMax int,
	passwordLengthMin int,
	passwordLengthMax int,
) (sfe *SettingsForFrontEnd, err error) {
	if messageSizeMax == 0 {
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_MessageSizeLimit)
	}
	if passwordLengthMin == 0 {
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_PasswordMinimumSize)
	}
	if passwordLengthMax == 0 {
		return nil, helper.NewError_ParameterIsNotSet(ParameterName_PasswordMaximumSize)
	}

	sfe = &SettingsForFrontEnd{
		MessageSizeMax:    messageSizeMax,
		PasswordLengthMin: passwordLengthMin,
		PasswordLengthMax: passwordLengthMax,
	}

	return sfe, nil
}
