package settings

import (
	"encoding/json"
	"errors"
	"os"

	ae "github.com/vault-thirteen/auxie/errors"
	"github.com/vault-thirteen/auxie/file"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

const (
	DefaultFilePath   = "settings.json"
	FileSizeThreshold = 100_000 // 100 KB.
)

type FrontEndSettings struct {
	Main *FrontEndMainSettings `json:"frontEnd"`
	RPC  *FrontEndRpcSettings  `json:"rpc"`
}

func GetFrontEndSettingsFromFile(settingsFilePath string) (s *FrontEndSettings, err error) {
	var fileSize int
	fileSize, err = file.GetFileSize(settingsFilePath)
	if err != nil {
		return nil, err
	}

	var rs FrontEndSettingsRoot

	if fileSize <= FileSizeThreshold {
		// Read the file into memory and parse it.
		var data []byte
		data, err = os.ReadFile(settingsFilePath)
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(data, &rs)
		if err != nil {
			return nil, err
		}

		return rs.Settings, nil
	}

	// Parse the file as a stream.
	var f *os.File
	f, err = os.Open(settingsFilePath)
	if err != nil {
		return nil, err
	}
	defer func() {
		derr := f.Close()
		if derr == nil {
			err = ae.Combine(err, derr)
		}
	}()

	decoder := json.NewDecoder(f)
	err = decoder.Decode(&rs)
	if err != nil {
		return nil, err
	}

	return rs.Settings, err
}

func (fes *FrontEndSettings) Validate() (err error) {
	if fes == nil {
		return errors.New(helper.Err_NullPointer)
	}

	err = fes.Main.Validate()
	if err != nil {
		return err
	}

	err = fes.RPC.Validate()
	if err != nil {
		return err
	}

	return nil
}
