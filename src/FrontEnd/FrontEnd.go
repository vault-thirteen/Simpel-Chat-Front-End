package chat

import (
	"log"
	"time"

	ver "github.com/vault-thirteen/auxie/Versioneer/classes/Versioneer"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/controls"
	rmc "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/rpc/Client"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/server"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/settings"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/watcher"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

type FrontEnd struct {
	ver      *ver.Versioneer
	settings *settings.FrontEndSettings
	controls *controls.Controls
	server   *server.Server
	watcher  *watcher.Watcher
}

func NewFrontEnd(settingsFilePath string, ver *ver.Versioneer) (fe *FrontEnd, err error) {
	if len(settingsFilePath) == 0 {
		settingsFilePath = settings.DefaultFilePath
	}

	fe = new(FrontEnd)

	fe.ver = ver

	fe.settings, err = settings.GetFrontEndSettingsFromFile(settingsFilePath)
	if err != nil {
		return nil, err
	}

	err = fe.settings.Validate()
	if err != nil {
		return nil, err
	}

	fe.controls = controls.NewControls(fe.emergencyShutdown)

	serverStartTime := time.Now().UTC()
	cec := fe.controls.GetCriticalErrorsChan()

	var rpcClient *rmc.Client
	rpcClient, err = rmc.NewClient(fe.settings.RPC)
	if err != nil {
		return nil, err
	}

	err = rpcClient.PingServer()
	if err != nil {
		return nil, err
	}

	fe.server, err = server.NewServer(fe.settings, cec, rpcClient, serverStartTime, fe.settings.Main.AssetsFolder)
	if err != nil {
		return nil, err
	}

	// If something crashes, the front-end must be stopped.
	fe.watcher = watcher.NewWatcher(fe.controls)
	fe.watcher.Start()

	return fe, nil
}

// Async.
func (fe *FrontEnd) emergencyShutdown() {
	fe.controls.GetIsEmergencyShutdown().Store(true)
	log.Println(helper.Msg_StartingEmergencyChatShutdown)

	// As this method is called asynchronously, the caller is guaranteed to
	// "finish" its WaitGroup. So, it is safe here to call the 'Stop' method
	// which waits for the WaitGroup. This is ugly, but this is how Go language
	// works.
	err := fe.Stop()
	if err != nil {
		log.Println(err.Error())
	}
}

func (fe *FrontEnd) Stop() (err error) {
	err = fe.server.Stop()
	if err != nil {
		return err
	}

	fe.watcher.AskToStop()
	fe.watcher.WaitForStop()

	*fe.controls.GetFrontEndStoppedChan() <- true

	return nil
}

func (fe *FrontEnd) GetStoppedChan() *chan bool {
	return fe.controls.GetFrontEndStoppedChan()
}
