package cc

import (
	"context"
	"encoding/json"
	"path"

	jrm1 "github.com/vault-thirteen/JSON-RPC-M1"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc/rqrp"
	mime "github.com/vault-thirteen/auxie/MIME"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/api"
	rmc "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/rpc/Client"
	cci "github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/server/CachedContentItem"
)

type CachedContent struct {
	IndexHtml           *cci.CachedContentItem
	MainJs              *cci.CachedContentItem
	ApiJs               *cci.CachedContentItem
	ModelsJs            *cci.CachedContentItem
	UiJs                *cci.CachedContentItem
	StylesCss           *cci.CachedContentItem
	FaviconPng          *cci.CachedContentItem
	SettingsJson        *cci.CachedContentItem
	FrontEndVersionJson *cci.CachedContentItem
}

func NewCachedContent(assetsFolderPath string, ttl int, rpcClient *rmc.Client, fev *api.FrontEndVersionForFrontEnd) (cc *CachedContent, err error) {
	cc = new(CachedContent)

	cc.IndexHtml, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_IndexHtml), ContentType_Html, ttl)
	if err != nil {
		return nil, err
	}

	cc.MainJs, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_MainJs), mime.TypeApplicationJavascript, ttl)
	if err != nil {
		return nil, err
	}

	cc.ApiJs, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_ApiJs), mime.TypeApplicationJavascript, ttl)
	if err != nil {
		return nil, err
	}

	cc.ModelsJs, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_ModelsJs), mime.TypeApplicationJavascript, ttl)
	if err != nil {
		return nil, err
	}

	cc.UiJs, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_UiJs), mime.TypeApplicationJavascript, ttl)
	if err != nil {
		return nil, err
	}

	cc.StylesCss, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_StylesCss), mime.TypeTextCss, ttl)
	if err != nil {
		return nil, err
	}

	cc.FaviconPng, err = cci.NewCachedContentItemFromFile(path.Join(assetsFolderPath, Asset_FaviconPng), mime.TypeImagePng, ttl)
	if err != nil {
		return nil, err
	}

	// Settings.
	{
		var stn *api.SettingsForFrontEnd
		stn, err = getSettingsFromServer(rpcClient)
		if err != nil {
			return nil, err
		}

		var buf []byte
		buf, err = json.Marshal(stn)
		if err != nil {
			return nil, err
		}

		cc.SettingsJson, err = cci.NewCachedContentItemFromBytes(buf, mime.TypeApplicationJson, ttl)
		if err != nil {
			return nil, err
		}
	}

	// Front-End Version.
	{
		fevr := api.FrontEndVersionForFrontEndRoot{FrontEndVersion: fev}

		var buf []byte
		buf, err = json.Marshal(fevr)
		if err != nil {
			return nil, err
		}

		cc.FrontEndVersionJson, err = cci.NewCachedContentItemFromBytes(buf, mime.TypeApplicationJson, ttl)
		if err != nil {
			return nil, err
		}
	}

	return cc, nil
}

func getSettingsFromServer(rpcClient *rmc.Client) (stn *api.SettingsForFrontEnd, err error) {
	var params = rqrp.SettingsParams{}
	var result = new(rqrp.SettingsResult)
	var re *jrm1.RpcError
	re, err = rpcClient.MakeRequest(context.Background(), rpc.Func_Settings, params, result)
	if err != nil {
		return nil, err
	}
	if re != nil {
		return nil, re.AsError()
	}

	stn, err = api.NewSettingsForFrontEnd(
		result.MessageSizeMax,
		result.PasswordLengthMin,
		result.PasswordLengthMax,
	)
	if err != nil {
		return nil, err
	}

	return stn, nil
}
