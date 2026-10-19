package settings

import (
	"github.com/vault-thirteen/auxie/errors"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

type FrontEndMessageSettings struct {
	MessageSizeMax int `json:"messageSizeMax"`
}

func (s *FrontEndMessageSettings) Validate() (err error) {
	if s == nil {
		return errors.ErrorFromText(helper.Err_NullPointer)
	}

	if s.MessageSizeMax == 0 {
		return helper.NewError_ParameterIsNotSet(ParameterName_MessageSizeLimit)
	}

	return nil
}
