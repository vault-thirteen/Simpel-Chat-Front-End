package server

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	jrm1 "github.com/vault-thirteen/JSON-RPC-M1"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc/rqrp"
	mime "github.com/vault-thirteen/auxie/MIME"
	ver "github.com/vault-thirteen/auxie/Versioneer/classes/Versioneer"
	"github.com/vault-thirteen/auxie/header"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/api"
	rmc "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/rpc/Client"
	cc "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/server/CachedContent"
	cci "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/server/CachedContentItem"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/settings"
	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/helper"
)

const UrlPath_Api = "api"

type Server struct {
	settings           *settings.FrontEndSettings
	rpcClient          *rmc.Client
	criticalErrorsChan *chan error
	listenDsn          string
	httpServer         *http.Server
	startTime          time.Time
	isRunning          *atomic.Bool
	stopTime           time.Time
	listenError        error
	fev                *api.FrontEndVersionForFrontEnd
	cachedContent      *cc.CachedContent
}

func NewServer(
	settings *settings.FrontEndSettings,
	criticalErrorsChan *chan error,
	rpcClient *rmc.Client,
	serverStartTimeTS time.Time,
	assetsFolder string,
	ver *ver.Versioneer,
) (srv *Server, err error) {
	srv = &Server{
		settings:           settings,
		rpcClient:          rpcClient,
		criticalErrorsChan: criticalErrorsChan,
		listenDsn:          net.JoinHostPort(settings.Main.HostName, strconv.Itoa(int(settings.Main.PortNumber))),
		startTime:          serverStartTimeTS,
		isRunning:          new(atomic.Bool),
	}

	srv.httpServer = &http.Server{
		Addr:    srv.listenDsn,
		Handler: http.Handler(http.HandlerFunc(srv.router)),
	}

	srv.fev, err = api.NewFrontEndVersionForFrontEnd(ver.ProgramName(), ver.ProgramVersionString(), ver.GoVersion())
	if err != nil {
		return nil, err
	}

	srv.cachedContent, err = cc.NewCachedContent(assetsFolder, srv.settings.Main.HttpContentCacheTime, rpcClient, srv.fev)
	if err != nil {
		return nil, err
	}

	go srv.run()

	return srv, nil
}

func (s *Server) router(rw http.ResponseWriter, req *http.Request) {
	left, right, ok := strings.Cut(req.URL.Path, helper.UrlPathSeparator)
	if !ok {
		s.httpRespond_BadRequest(rw)
		return
	}

	if len(left) != 0 {
		s.httpRespond_NotFound(rw)
		return
	}

	switch right {
	case UrlPath_Api:
		s.processApiRequest(rw, req)
		return

	case "", cc.Asset_IndexHtml:
		s.httpRespond_CachedContent(rw, s.cachedContent.IndexHtml)
		return

	case cc.Asset_MainJs:
		s.httpRespond_CachedContent(rw, s.cachedContent.MainJs)
		return

	case cc.Asset_ApiJs:
		s.httpRespond_CachedContent(rw, s.cachedContent.ApiJs)
		return

	case cc.Asset_ModelsJs:
		s.httpRespond_CachedContent(rw, s.cachedContent.ModelsJs)
		return

	case cc.Asset_UiJs:
		s.httpRespond_CachedContent(rw, s.cachedContent.UiJs)
		return

	case cc.Asset_StylesCss:
		s.httpRespond_CachedContent(rw, s.cachedContent.StylesCss)
		return

	case cc.Asset_FaviconPng:
		s.httpRespond_CachedContent(rw, s.cachedContent.FaviconPng)
		return

	case cc.Asset_SettingsJson:
		s.httpRespond_CachedContent(rw, s.cachedContent.SettingsJson)
		return

	case cc.Asset_FrontEndVersionJson:
		s.httpRespond_CachedContent(rw, s.cachedContent.FrontEndVersionJson)
		return

	default:
		s.httpRespond_NotFound(rw)
		return
	}
}

func (s *Server) httpRespond_BadRequest(rw http.ResponseWriter) {
	rw.WriteHeader(http.StatusBadRequest)
}
func (s *Server) httpRespond_NotFound(rw http.ResponseWriter) {
	rw.WriteHeader(http.StatusNotFound)
}
func (s *Server) httpRespond_InternalServerError(rw http.ResponseWriter) {
	rw.WriteHeader(http.StatusInternalServerError)
}
func (s *Server) httpRespond_CachedContent(rw http.ResponseWriter, i *cci.CachedContentItem) {
	now := time.Now().UTC()
	rw.Header().Set(header.HttpHeaderContentType, i.ContentType())
	helper.SetCacheTime(rw, i.TTLSec(), now)

	_, err := rw.Write(i.Data())
	if err != nil {
		log.Println(err)
	}
}

func (s *Server) processApiRequest(rw http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		s.httpRespond_BadRequest(rw)
		return
	}

	var ar api.ApiRequest
	err := json.NewDecoder(req.Body).Decode(&ar)
	if err != nil {
		s.httpRespond_BadRequest(rw)
		return
	}

	var params any
	var result any
	var funcName string
	var re *jrm1.RpcError

	switch ar.Action {
	// Ping.
	case rpc.Func_Ping:
		{
			funcName = rpc.Func_Ping
			p := rqrp.PingParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.PingResult)
		}

	// Version & Settings.
	case rpc.Func_Version:
		{
			funcName = rpc.Func_Version
			p := rqrp.VersionParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.VersionResult)
		}
	case rpc.Func_Settings:
		{
			funcName = rpc.Func_Settings
			p := rqrp.SettingsParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.SettingsResult)
		}

	// Auth functions.
	case rpc.Func_RegisterUser1:
		{
			funcName = rpc.Func_RegisterUser1
			p := rqrp.RegisterUser1Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.RegisterUser1Result)
		}
	case rpc.Func_RegisterUser2:
		{
			funcName = rpc.Func_RegisterUser2
			p := rqrp.RegisterUser2Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.RegisterUser2Result)
		}
	case rpc.Func_LogIn1:
		{
			funcName = rpc.Func_LogIn1
			p := rqrp.LogIn1Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.LogIn1Result)
		}
	case rpc.Func_LogIn2:
		{
			funcName = rpc.Func_LogIn2
			p := rqrp.LogIn2Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.LogIn2Result)
		}
	case rpc.Func_LogOut1:
		{
			funcName = rpc.Func_LogOut1
			p := rqrp.LogOut1Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.LogOut1Result)
		}
	case rpc.Func_LogOut2:
		{
			funcName = rpc.Func_LogOut2
			p := rqrp.LogOut2Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.LogOut2Result)
		}
	case rpc.Func_ChangePassword1:
		{
			funcName = rpc.Func_ChangePassword1
			p := rqrp.ChangePassword1Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ChangePassword1Result)
		}
	case rpc.Func_ChangePassword2:
		{
			funcName = rpc.Func_ChangePassword2
			p := rqrp.ChangePassword2Params{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ChangePassword2Result)
		}
	case rpc.Func_BanUser:
		{
			funcName = rpc.Func_BanUser
			p := rqrp.BanUserParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.BanUserResult)
		}
	case rpc.Func_IsMeAdministrator:
		{
			funcName = rpc.Func_IsMeAdministrator
			p := rqrp.IsMeAdministratorParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.IsMeAdministratorResult)
		}

	// Room functions.
	case rpc.Func_AddRoom:
		{
			funcName = rpc.Func_AddRoom
			p := rqrp.AddRoomParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.AddRoomResult)
		}
	case rpc.Func_DeleteRoom:
		{
			funcName = rpc.Func_DeleteRoom
			p := rqrp.DeleteRoomParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.DeleteRoomResult)
		}
	case rpc.Func_ListRooms:
		{
			funcName = rpc.Func_ListRooms
			p := rqrp.ListRoomsParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListRoomsResult)
		}

	// Room Moderator functions.
	case rpc.Func_AddRoomModerator:
		{
			funcName = rpc.Func_AddRoomModerator
			p := rqrp.AddRoomModeratorParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.AddRoomModeratorResult)
		}
	case rpc.Func_DeleteRoomModerator:
		{
			funcName = rpc.Func_DeleteRoomModerator
			p := rqrp.DeleteRoomModeratorParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.DeleteRoomModeratorResult)
		}
	case rpc.Func_ListRoomModerators:
		{
			funcName = rpc.Func_ListRoomModerators
			p := rqrp.ListRoomModeratorsParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListRoomModeratorsResult)
		}
	case rpc.Func_ResetRoomModerators:
		{
			funcName = rpc.Func_ResetRoomModerators
			p := rqrp.ResetRoomModeratorsParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ResetRoomModeratorsResult)
		}

	// Allowed Room User functions.
	case rpc.Func_AddAllowedRoomUser:
		{
			funcName = rpc.Func_AddAllowedRoomUser
			p := rqrp.AddAllowedRoomUserParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.AddAllowedRoomUserResult)
		}
	case rpc.Func_DeleteAllowedRoomUser:
		{
			funcName = rpc.Func_DeleteAllowedRoomUser
			p := rqrp.DeleteAllowedRoomUserParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.DeleteAllowedRoomUserResult)
		}
	case rpc.Func_ListAllowedRoomUsers:
		{
			funcName = rpc.Func_ListAllowedRoomUsers
			p := rqrp.ListAllowedRoomUsersParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListAllowedRoomUsersResult)
		}
	case rpc.Func_ResetAllowedRoomUsers:
		{
			funcName = rpc.Func_ResetAllowedRoomUsers
			p := rqrp.ResetAllowedRoomUsersParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ResetAllowedRoomUsersResult)
		}

	// User Room functions.
	case rpc.Func_EnterRoom:
		{
			funcName = rpc.Func_EnterRoom
			p := rqrp.EnterRoomParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.EnterRoomResult)
		}
	case rpc.Func_LeaveRoom:
		{
			funcName = rpc.Func_LeaveRoom
			p := rqrp.LeaveRoomParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.LeaveRoomResult)
		}
	case rpc.Func_GetMyRoomId:
		{
			funcName = rpc.Func_GetMyRoomId
			p := rqrp.GetMyRoomIdParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.GetMyRoomIdResult)
		}
	case rpc.Func_GetRoom:
		{
			funcName = rpc.Func_GetRoom
			p := rqrp.GetRoomParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.GetRoomResult)
		}
	case rpc.Func_GetRoomUsers:
		{
			funcName = rpc.Func_GetRoomUsers
			p := rqrp.GetRoomUsersParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.GetRoomUsersResult)
		}

	// Message functions.
	case rpc.Func_AddMessage:
		{
			funcName = rpc.Func_AddMessage
			p := rqrp.AddMessageParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.AddMessageResult)
		}
	case rpc.Func_ListAllMessages:
		{
			funcName = rpc.Func_ListAllMessages
			p := rqrp.ListAllMessagesParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListAllMessagesResult)
		}
	case rpc.Func_ListMessagesSince:
		{
			funcName = rpc.Func_ListMessagesSince
			p := rqrp.ListMessagesSinceParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListMessagesSinceResult)
		}

	// User functions.
	case rpc.Func_GetUser:
		{
			funcName = rpc.Func_GetUser
			p := rqrp.GetUserParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.GetUserResult)
		}
	case rpc.Func_ListUsers:
		{
			funcName = rpc.Func_ListUsers
			p := rqrp.ListUsersParams{}
			err = json.Unmarshal(ar.Parameters, &p)
			if err != nil {
				s.httpRespond_BadRequest(rw)
				return
			}
			params = p
			result = new(rqrp.ListUsersResult)
		}

	default:
		s.httpRespond_BadRequest(rw)
		return
	}

	re, err = s.rpcClient.MakeRequest(context.Background(), funcName, params, result)
	if err != nil {
		s.processInternalServerError(rw, err)
		return
	}

	var response = &api.ApiResponse{
		Action: ar.Action,
		Result: result,
		Error:  re,
	}
	s.respondWithJsonObject(rw, response)
	return
}
func (s *Server) processInternalServerError(rw http.ResponseWriter, err error) {
	log.Printf("err: %+v", err)
	s.httpRespond_InternalServerError(rw)
}

func (s *Server) respondWithJsonObject(rw http.ResponseWriter, obj any) {
	rw.Header().Set(header.HttpHeaderContentType, mime.TypeApplicationJson)

	err := json.NewEncoder(rw).Encode(obj)
	if err != nil {
		log.Println(err)
		return
	}
}

// Async.
func (s *Server) run() {
	s.isRunning.Store(true)

	defer func() {
		s.stopTime = time.Now().UTC()
		s.isRunning.Store(false)
	}()

	// If either the server crashes or it is stopped manually, we get here. So,
	// the function returns in any case. So, it is safe to leave this function
	// as it is without any WaitGroup guards.
	s.listenError = s.httpServer.ListenAndServeTLS(s.settings.Main.CertFile, s.settings.Main.KeyFile)

	// Report about a critical error to the parent object.
	if !errors.Is(s.listenError, http.ErrServerClosed) {
		*s.criticalErrorsChan <- s.listenError
	}
}

func (s *Server) IsRunning() bool {
	return s.isRunning.Load()
}

func (s *Server) Stop() (err error) {
	ctx, cf := context.WithTimeout(context.Background(), time.Minute)
	defer cf()

	err = s.httpServer.Shutdown(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (s *Server) GetStartTime() time.Time { return s.startTime }
