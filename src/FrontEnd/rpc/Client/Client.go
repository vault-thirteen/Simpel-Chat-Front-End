package rmc

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/url"

	"github.com/vault-thirteen/JSON-RPC-M1"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc"
	"github.com/vault-thirteen/Simpel-Chat-Server/src/Chat/models/rpc/rqrp"
	"github.com/vault-thirteen/auxie/number"

	"github.com/vault-thirteen/Simpel-Chat-Front-End/src/FrontEnd/settings"
)

type Client struct {
	jc *jrm1.Client
}

func NewClient(settings *settings.FrontEndRpcSettings) (rpcClient *Client, err error) {
	schema := settings.Schema
	host := settings.ServerName
	port := settings.PortNumber
	path := settings.ApiPath
	enableSelfSignedCertificate := settings.EnableSelfSignedCertificate
	dsn := fmt.Sprintf("%s://%s:%d%s", schema, host, port, path)

	var dsnUrl *url.URL
	dsnUrl, err = url.Parse(dsn)
	if err != nil {
		return nil, err
	}

	var customHttpClient *http.Client
	if (dsnUrl.Scheme == rpc.UrlSchemeHttps) && enableSelfSignedCertificate {
		customHttpClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
			},
		}
	}

	return newCustomClient(dsnUrl, customHttpClient)
}

func newCustomClient(dsnUrl *url.URL, customHttpClient *http.Client) (client *Client, err error) {
	var port uint16
	port, err = number.ParseUint16(dsnUrl.Port())
	if err != nil {
		return nil, err
	}

	path := dsnUrl.RequestURI()

	var clientSettings *jrm1.ClientSettings
	clientSettings, err = jrm1.NewClientSettings(dsnUrl.Scheme, dsnUrl.Hostname(), port, path, customHttpClient, nil, true)
	if err != nil {
		return nil, err
	}

	var rpcClient *jrm1.Client
	rpcClient, err = jrm1.NewClient(clientSettings)
	if err != nil {
		return nil, err
	}

	client = &Client{
		jc: rpcClient,
	}

	return client, nil
}

func (cli *Client) MakeRequest(ctx context.Context, method string, params any, result any) (re *jrm1.RpcError, err error) {
	return cli.jc.Call(ctx, method, params, result)
}

func (cli *Client) PingServer() (err error) {
	var params = rqrp.PingParams{}
	var result = new(rqrp.PingResult)
	var re *jrm1.RpcError

	re, err = cli.MakeRequest(context.Background(), rpc.Func_Ping, params, result)
	if err != nil {
		return err
	}
	if re != nil {
		return re.AsError()
	}

	return nil
}
