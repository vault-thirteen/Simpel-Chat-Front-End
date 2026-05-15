package settings

import (
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
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
		return nil, helper.NewError_ParameterIsNotSet("message size limit")
	}
	if passwordLengthMin == 0 {
		return nil, helper.NewError_ParameterIsNotSet("password minimum size")
	}
	if passwordLengthMax == 0 {
		return nil, helper.NewError_ParameterIsNotSet("password maximum size")
	}

	sfe = &SettingsForFrontEnd{
		MessageSizeMax:    messageSizeMax,
		PasswordLengthMin: passwordLengthMin,
		PasswordLengthMax: passwordLengthMax,
	}

	return sfe, nil
}
