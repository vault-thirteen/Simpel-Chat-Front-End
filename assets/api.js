// Function names.
const FuncName = {
	// Ping.
	Ping: "Ping",

	// Version & Settings.
	Version: "Version",
	Settings: "Settings",

	// Auth functions.
	RegisterUser1: "RegisterUser1",
	RegisterUser2: "RegisterUser2",
	LogIn1: "LogIn1",
	LogIn2: "LogIn2",
	LogOut1: "LogOut1",
	LogOut2: "LogOut2",
	ChangePassword1: "ChangePassword1",
	ChangePassword2: "ChangePassword2",
	BanUser: "BanUser",
	IsMeAdministrator: "IsMeAdministrator",

	// Room functions.
	AddRoom: "AddRoom",
	DeleteRoom: "DeleteRoom",
	ListRooms: "ListRooms",

	// Room Moderator functions.
	AddRoomModerator: "AddRoomModerator",
	DeleteRoomModerator: "DeleteRoomModerator",
	ListRoomModerators: "ListRoomModerators",
	ResetRoomModerators: "ResetRoomModerators",

	// Allowed Room User functions.
	AddAllowedRoomUser: "AddAllowedRoomUser",
	DeleteAllowedRoomUser: "DeleteAllowedRoomUser",
	ListAllowedRoomUsers: "ListAllowedRoomUsers",
	ResetAllowedRoomUsers: "ResetAllowedRoomUsers",

	// User Room functions.
	EnterRoom: "EnterRoom",
	LeaveRoom: "LeaveRoom",
	GetMyRoomId: "GetMyRoomId",
	GetRoom: "GetRoom",
	GetRoomUsers: "GetRoomUsers",

	// Message functions.
	AddMessage: "AddMessage",
	ListAllMessages: "ListAllMessages",
	ListMessagesSince: "ListMessagesSince",

	// User functions.
	GetUser: "GetUser",
	ListUsers: "ListUsers",
};

class ApiRequest {
	constructor(action, parameters) {
		this.action = action;
		this.parameters = parameters;
	}

	static composeFrontEndError(hr) {
		return Err.FrontEndError + ": " + hr.text +
			"(HTTP Status Code " + hr.statusCode + ")";
	}

	static composeActionMismatchError(hr, ar) {
		return Err.FrontEndError + ": " + Err.ActionMismatch + ": " +
			hr.action + " vs " + ar.action;
	}

	async send(url) {
		let hReq = new HttpRequest(url, HttpMethod.Post, this);
		let hResp = await hReq.send();

		if (!hResp.isOk) {
			console.error(ApiRequest.composeFrontEndError(hResp));
			return null;
		}

		if (hResp.jsonObject.action !== this.action) {
			console.error(ApiRequest.composeActionMismatchError(hResp, this));
			return null;
		}

		return new ApiResponse().fromJson(hResp.jsonObject);
	}
}

class ApiResponse {
	constructor(action, result, error) {
		this.action = action;
		this.result = result;
		this.error = error;
	}

	fromJson(j) {
		let ar = new ApiResponse(j.action, j.result, j.error);
		Object.assign(this, ar);
		return this;
	}

	hasError() {
		return ((this.error != null) || (this.result == null));
	}
}

class HttpRequest {
	constructor(url, method, data) {
		this.url = url;
		this.method = method;
		this.data = data;
	}

	async send() {
		let ri;
		if (this.data==null){
			ri = {
				method: this.method,
			};
		} else {
			ri = {
				method: this.method,
				body: JSON.stringify(this.data),
			};
		}
		let resp = await fetch(this.url, ri);
		let respClone = resp.clone();
		let jd = await resp.json();
		let txt = await respClone.text();
		return new HttpResponse(resp, jd, txt);
	}
}

class HttpResponse {
	constructor(response, jsonData, text) {
		this.rawResponse = response;
		this.jsonObject = jsonData;
		this.text = text;
		this.setFields();
	}

	setFields() {
		let x = this.rawResponse;
		this.statusCode = x.status;
		this.isOk = (x.ok) && (this.statusCode === 200) && (this.jsonObject != null);
	}
}

// Models.

class Auth {
	constructor(token) {
		this.token = token;
	}
}

class Parameters_RegisterUser1 {
	constructor(email) {
		this.email = email;
	}
}

class Parameters_RegisterUser2 {
	constructor(email, requestId, verificationCode, userName, userPassword) {
		this.email = email;
		this.requestId = requestId;
		this.verificationCode = verificationCode;
		this.userName = userName;
		this.userPassword = userPassword;
	}
}

class Parameters_LogIn1 {
	constructor(email) {
		this.email = email;
	}
}

class Parameters_LogIn2 {
	constructor(email, requestId, verificationCode, userPassword) {
		this.email = email;
		this.requestId = requestId;
		this.verificationCode = verificationCode;
		this.userPassword = userPassword;
	}
}

class Parameters_LogOut1 {
	constructor(token) {
		this.auth = new Auth(token);
	}
}

class Parameters_LogOut2 {
	constructor(token, requestId) {
		this.auth = new Auth(token);
		this.requestId = requestId;
	}
}

class Parameters_ChangePassword1 {
	constructor(token) {
		this.auth = new Auth(token);
	}
}

class Parameters_ChangePassword2 {
	constructor(token, requestId, verificationCode, userPassword, newUserPassword1, newUserPassword2) {
		this.auth = new Auth(token);
		this.requestId = requestId;
		this.verificationCode = verificationCode;
		this.userPassword = userPassword;
		this.newUserPassword1 = newUserPassword1;
		this.newUserPassword2 = newUserPassword2;
	}
}

class Parameters_BanUser {
	constructor(token, userId) {
		this.auth = new Auth(token);
		this.userId = userId;
	}
}

class Parameters_IsMeAdministrator {
	constructor(token) {
		this.auth = new Auth(token);
	}
}

class Parameters_AddRoom {
	constructor(token, roomType, roomName) {
		this.auth = new Auth(token);
		this.roomType = roomType;
		this.roomName = roomName;
	}
}

class Parameters_DeleteRoom {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_ListRooms {
	constructor(token) {
		this.auth = new Auth(token);
	}
}

class Parameters_AddRoomModerator {
	constructor(token, roomId, userId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.userId = userId;
	}
}

class Parameters_DeleteRoomModerator {
	constructor(token, roomId, userId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.userId = userId;
	}
}

class Parameters_ListRoomModerators {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_ResetRoomModerators {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_AddAllowedRoomUser {
	constructor(token, roomId, userId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.userId = userId;
	}
}

class Parameters_DeleteAllowedRoomUser {
	constructor(token, roomId, userId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.userId = userId;
	}
}

class Parameters_ListAllowedRoomUsers {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_ResetAllowedRoomUsers {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_EnterRoom {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_LeaveRoom {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_GetMyRoomId {
	constructor(token) {
		this.auth = new Auth(token);
	}
}

class Parameters_GetRoom {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_GetRoomUsers {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_AddMessage {
	constructor(token, roomId, messageText) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.messageText = messageText;
	}
}

class Parameters_ListAllMessages {
	constructor(token, roomId) {
		this.auth = new Auth(token);
		this.roomId = roomId;
	}
}

class Parameters_ListMessagesSince {
	constructor(token, roomId, timeMarkTS) {
		this.auth = new Auth(token);
		this.roomId = roomId;
		this.timeMarkTS = timeMarkTS;
	}
}

class Parameters_GetUser {
	constructor(token, userId) {
		this.auth = new Auth(token);
		this.userId = userId;
	}
}

class Parameters_ListUsers {
	constructor(token, pageSize, pageNumber) {
		this.auth = new Auth(token);
		this.pageSize = pageSize;
		this.pageNumber = pageNumber;
	}
}

// RPC Controller.
class Rpc {
	constructor(url) {
		this.url = url;
		if (this.url == null) {
			this.url = mc.path.api;
		}
		this.lastResult = null;
	}

	setLastResult(rpcResp) {
		this.lastResult = rpcResp.result;
	}

	getLastResult() {
		return this.lastResult;
	}

	composeRpcError(ar) {
		let txt = "(" + ar.error.code + ") " + ar.error.message;
		if (ar.error.data != null) {
			txt = txt + " [*] Data: " + JSON.stringify(ar.error.data);
		}
		return Err.RpcError + ": " + txt;
	}

	async call(apiReq) {
		let apiResp = await apiReq.send(this.url);

		if ((apiResp.result == null) || (apiResp.error != null)) {
			console.error(this.composeRpcError(apiResp));
			return apiResp;
		}

		return apiResp;
	}

	async ping() {
		return await this.call(new ApiRequest(FuncName.Ping, {}));
	}

	async version() {
		return await this.call(new ApiRequest(FuncName.Version, {}));
	}

	async settings() {
		return await this.call(new ApiRequest(FuncName.Settings, {}));
	}

	async registerUser1(email) {
		let params = new Parameters_RegisterUser1(email);
		return await this.call(new ApiRequest(FuncName.RegisterUser1, params));
	}

	async registerUser2(email, requestId, verificationCode, userName, userPassword) {
		let params = new Parameters_RegisterUser2(email, requestId, verificationCode, userName, userPassword);
		return await this.call(new ApiRequest(FuncName.RegisterUser2, params));
	}

	async logIn1(email) {
		let params = new Parameters_LogIn1(email);
		return await this.call(new ApiRequest(FuncName.LogIn1, params));
	}

	async logIn2(email, requestId, verificationCode, userPassword) {
		let params = new Parameters_LogIn2(email, requestId, verificationCode, userPassword);
		return await this.call(new ApiRequest(FuncName.LogIn2, params));
	}

	async logOut1(token) {
		let params = new Parameters_LogOut1(token);
		return await this.call(new ApiRequest(FuncName.LogOut1, params));
	}

	async logOut2(token, requestId) {
		let params = new Parameters_LogOut2(token, requestId);
		return await this.call(new ApiRequest(FuncName.LogOut2, params));
	}

	async changePassword1(token) {
		let params = new Parameters_ChangePassword1(token);
		return await this.call(new ApiRequest(FuncName.ChangePassword1, params));
	}

	async changePassword2(token, requestId, verificationCode, userPassword, newUserPassword1, newUserPassword2) {
		let params = new Parameters_ChangePassword2(token, requestId, verificationCode, userPassword, newUserPassword1, newUserPassword2);
		return await this.call(new ApiRequest(FuncName.ChangePassword2, params));
	}

	async banUser(token, userId) {
		let params = new Parameters_BanUser(token, userId);
		return await this.call(new ApiRequest(FuncName.BanUser, params));
	}

	async isMeAdministrator(token) {
		let params = new Parameters_IsMeAdministrator(token);
		return await this.call(new ApiRequest(FuncName.IsMeAdministrator, params));
	}

	async addRoom(token, roomType, roomName) {
		let params = new Parameters_AddRoom(token, roomType, roomName);
		return await this.call(new ApiRequest(FuncName.AddRoom, params));
	}

	async deleteRoom(token, roomId) {
		let params = new Parameters_DeleteRoom(token, roomId);
		return await this.call(new ApiRequest(FuncName.DeleteRoom, params));
	}

	async listRooms(token) {
		let params = new Parameters_ListRooms(token);
		return await this.call(new ApiRequest(FuncName.ListRooms, params));
	}

	async addRoomModerator(token, roomId, userId) {
		let params = new Parameters_AddRoomModerator(token, roomId, userId);
		return await this.call(new ApiRequest(FuncName.AddRoomModerator, params));
	}

	async deleteRoomModerator(token, roomId, userId) {
		let params = new Parameters_DeleteRoomModerator(token, roomId, userId);
		return await this.call(new ApiRequest(FuncName.DeleteRoomModerator, params));
	}

	async listRoomModerators(token, roomId) {
		let params = new Parameters_ListRoomModerators(token, roomId);
		return await this.call(new ApiRequest(FuncName.ListRoomModerators, params));
	}

	async resetRoomModerators(token, roomId) {
		let params = new Parameters_ResetRoomModerators(token, roomId);
		return await this.call(new ApiRequest(FuncName.ResetRoomModerators, params));
	}

	async addAllowedRoomUser(token, roomId, userId) {
		let params = new Parameters_AddAllowedRoomUser(token, roomId, userId);
		return await this.call(new ApiRequest(FuncName.AddAllowedRoomUser, params));
	}

	async deleteAllowedRoomUser(token, roomId, userId) {
		let params = new Parameters_DeleteAllowedRoomUser(token, roomId, userId);
		return await this.call(new ApiRequest(FuncName.DeleteAllowedRoomUser, params));
	}

	async listAllowedRoomUsers(token, roomId) {
		let params = new Parameters_ListAllowedRoomUsers(token, roomId);
		return await this.call(new ApiRequest(FuncName.ListAllowedRoomUsers, params));
	}

	async resetAllowedRoomUsers(token, roomId) {
		let params = new Parameters_ResetAllowedRoomUsers(token, roomId);
		return await this.call(new ApiRequest(FuncName.ResetAllowedRoomUsers, params));
	}

	async enterRoom(token, roomId) {
		let params = new Parameters_EnterRoom(token, roomId);
		return await this.call(new ApiRequest(FuncName.EnterRoom, params));
	}

	async leaveRoom(token, roomId) {
		let params = new Parameters_LeaveRoom(token, roomId);
		return await this.call(new ApiRequest(FuncName.LeaveRoom, params));
	}

	async getMyRoomId(token) {
		let params = new Parameters_GetMyRoomId(token);
		return await this.call(new ApiRequest(FuncName.GetMyRoomId, params));
	}

	async getRoom(token, roomId) {
		let params = new Parameters_GetRoom(token, roomId);
		return await this.call(new ApiRequest(FuncName.GetRoom, params));
	}

	async getRoomUsers(token, roomId) {
		let params = new Parameters_GetRoomUsers(token, roomId);
		return await this.call(new ApiRequest(FuncName.GetRoomUsers, params));
	}

	async addMessage(token, roomId, messageText) {
		let params = new Parameters_AddMessage(token, roomId, messageText);
		return await this.call(new ApiRequest(FuncName.AddMessage, params));
	}

	async listAllMessages(token, roomId) {
		let params = new Parameters_ListAllMessages(token, roomId);
		return await this.call(new ApiRequest(FuncName.ListAllMessages, params));
	}

	async listMessagesSince(token, roomId, timeMarkTS) {
		let params = new Parameters_ListMessagesSince(token, roomId, timeMarkTS);
		return await this.call(new ApiRequest(FuncName.ListMessagesSince, params));
	}

	async getUser(token, userId) {
		let params = new Parameters_GetUser(token, userId);
		return await this.call(new ApiRequest(FuncName.GetUser, params));
	}

	async listUsers(token, pageSize, pageNumber) {
		let params = new Parameters_ListUsers(token, pageSize, pageNumber);
		return await this.call(new ApiRequest(FuncName.ListUsers, params));
	}
}

const RpcErrorCode = {
	SessionIsNotFound: 16,
}
