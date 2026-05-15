package helper

import (
	"errors"
	"fmt"
)

const (
	Err_NullPointer                     = "null pointer"
	Err_ParameterIsNotSet               = "parameter is not set"
	Err_Critical                        = "critical error"
	Err_PathToConfigurationFileIsNotSet = "path to configuration file is not set"
	Err_FilePathIsNotSet                = "file path is not set"
	Err_ContentTypeIsNotSet             = "content type is not set"
	Err_NoBytes                         = "no bytes"
)

func NewError_Simple2SA(format string, value any) error {
	return errors.New(fmt.Sprintf(format, value))
}

func NewError_ParameterIsNotSet(parameterName string) error {
	return NewError_Simple2SA(Err_ParameterIsNotSet+": %+v", parameterName)
}

func NewError_GenericError(text string, value any) error {
	return NewError_Simple2SA(text+": %+v", value)
}
