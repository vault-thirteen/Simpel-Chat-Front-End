class MC {
	constructor(pageOpeningType, request, settings, version, fev, user) {
		this.path = new Path("/api", "/settings.json","/frontend-version.json");
		this.rpc = new Rpc(this.path.api);
		this.request = request;
		this.settings = settings;
		this.version = version;
		this.fev=fev;
		this.user = user;
		this.room = null;
		this.cs = null;
	}

	async init() {
		this.request = new Request();

		this.settings = await new Settings();
		(await this.settings.fetch()).save().load();

		this.version = new Version();
		(await this.version.fetch()).save().load();

		this.fev = new FEV();
		(await this.fev.fetch()).save().load();

		initHeaderAndFooter();

		this.user = await new User();
		let x = await this.user.fetch();
		return (x != null);
	}
}

const PageOpeningType = {
	FirstTime: 1,
	ChangeOfPage: 2,
	Refresh: 3,
}

// Names of JavaScript local storage variables.
const Varname = {
	// JavaScript engine.
	PreviousPage: "pp",
	IsPageReloading: "ipr",

	// Settings.
	Settings_LoadTime: "settings_LoadTime",
	Settings_MessageSizeMax: "settings_MessageSizeMax",
	Settings_PasswordLengthMin: "settings_PasswordLengthMin",
	Settings_PasswordLengthMax: "settings_PasswordLengthMax",

	// Server's Version.
	Version_ServerName: "version_ServerName",
	Version_ChatFamily: "version_ChatFamily",
	Version_AppName: "version_AppName",
	Version_AppVersion: "version_AppVersion",
	Version_Golang: "version_Golang",

	// Front-end's Version.
	FEV_AppName: "fev_AppName",
	FEV_AppVersion: "fev_AppVersion",
	FEV_GoVersion: "fev_GoVersion",

	// Token.
	Token: "token",
}

const QueryParameter = {
	Page: "page",
}

const HttpMethod = {
	Get: "GET",
	Post: "POST",
}

class Request {
	constructor() {
		this.queryString = window.location.search;
		this.urlParams = new URLSearchParams(this.queryString);
		this.page = this.urlParams.get(QueryParameter.Page);
		this.pageOpeningType = this.getPageOpeningType();
	}

	getPageOpeningType() {
		let ipr = sessionStorage.getItem(Varname.IsPageReloading);
		if (ipr == null) {
			return PageOpeningType.FirstTime;
		}
		sessionStorage.removeItem(Varname.IsPageReloading);

		let pp = sessionStorage.getItem(Varname.PreviousPage);
		if (this.page !== pp) {
			return PageOpeningType.ChangeOfPage;
		}

		return PageOpeningType.Refresh;
	}

	hasParameter(name) {
		return this.urlParams.has(name);
	}

	parameter(name) {
		return this.urlParams.get(name);
	}
}

const Page = {
	Default: "main",
	Main: "main",
	LogReg: "logreg",
	Register: "reg",
	LogIn: "login",
	LogOut: "logout",
	ChangePassword: "chpwd",
	BanUser: "ban",
	AddRoom: "addroom",
	DeleteRoom: "delroom",
	ListRooms: "rooms",
	Room: "room",
	Moderators: "moderators",
	ARU: "aru",
	ShowUser: "user",
	ListUsers: "users",
}

const ClassNames = {
	PageNotFound: "pageNotFound",
	CurrentRoomIndicator: "currentRoomIndicator",
}

// Messages.
const Msg = {
	Dot: ".",
	GenericErrorPrefix: "Error: ",
	SettingsReceived: "Settings have been received",
	VersionReceived: "Server version has been received",
	FEVReceived: "Front-end version has been received",
	SessionIsOutdated: "Session is outdated",
	YouAreAnAdministrator: "You are an administrator",
	EnteringRoom: "Entering room",
	LeavingRoom: "Leaving room",
};

class Info {
	static banUser(userId) {
		return "A user was banned (ID=" + userId + ").";
	}

	static addRoom(roomId) {
		return "A room was created (ID=" + roomId + ").";
	}

	static deleteRoom(roomId) {
		return "A room was deleted (ID=" + roomId + ").";
	}

	static addRoomModerator(userId, roomId) {
		return "User (ID=" + userId + ") was added as Moderator to a Room (ID=" + roomId + ").";
	}

	static deleteRoomModerator(userId, roomId) {
		return "User (ID=" + userId + ") was deleted from Moderators of a Room (ID=" + roomId + ").";
	}

	static resetRoomModerators(roomId) {
		return "All Moderators were deleted from a Room (ID=" + roomId + ").";
	}

	static addAllowedRoomUser(userId, roomId) {
		return "User (ID=" + userId + ") was added as allowed user to a Room (ID=" + roomId + ").";
	}

	static deleteAllowedRoomUser(userId, roomId) {
		return "User (ID=" + userId + ") was deleted from allowed users of a Room (ID=" + roomId + ").";
	}

	static resetAllowedRoomUsers(roomId) {
		return "All allowed users were deleted from a Room (ID=" + roomId + ").";
	}
}

// Errors.
const Err = {
	FrontEndError: "Front-end error",
	RpcError: "RPC error",
	ActionMismatch: "action mismatch",
	Settings: "settings error",
	Version: "version error",
	Unknown: "unknown error",
	BooleanToString: "booleanToString: ",
	UnknownActionPage: "Unknown action page: ",
	UnknownElementType: "Unknown element type: ",
	UnknownPageContentType: "Unknown page content type: ",
	EmailAddressIsNotValid: "E-Mail address is not valid",
	CaptchaAnswerIsNotSet: "Captcha answer is not set",
	VerificationCodeIsNotSet: "Verification code is not set",
	PasswordIsNotSet: "Password is not set",
	PasswordIsNotAllowed: "Password is not allowed",
	RequestIdIsNotSet: "Request ID is not set",
	PasswordIsDifferent: "Password is different",
	NameIsNotSet: "Name is not set",
	SelfSwitch: "Can not switch to itself",
	ArgumentMustBeAnArray: "Argument must be an array",
	MessageIsTooLong: "Message is too long",
	UserIsAlreadyLoaded: "User is already loaded",
	DatabaseIsBroken: "Database is broken",
};

class Settings {
	constructor(messageSizeMax, passwordLengthMin, passwordLengthMax) {
		this.messageSizeMax = messageSizeMax;
		this.passwordLengthMin = passwordLengthMin;
		this.passwordLengthMax = passwordLengthMax;
		this.roomUpdateIntervalMs = 10 * 1000;
	}

	fromJson(j) {
		let s = new Settings(j.messageSizeMax, j.passwordLengthMin, j.passwordLengthMax);
		Object.assign(this, s);
		return this;
	}

	async fetch() {
		let r = await fetch(mc.path.settings);
		this.fromJson(await r.json());
		console.info(Msg.SettingsReceived + Msg.Dot);
		return this;
	}

	save() {
		let timeNow = new Now();
		localStorage.setItem(Varname.Settings_MessageSizeMax, this.messageSizeMax.toString());
		localStorage.setItem(Varname.Settings_PasswordLengthMin, this.passwordLengthMin.toString());
		localStorage.setItem(Varname.Settings_PasswordLengthMax, this.passwordLengthMax.toString());
		localStorage.setItem(Varname.Settings_LoadTime, timeNow.ts.toString());
		return this;
	}

	load() {
		let loadTime = localStorage.getItem(Varname.Settings_LoadTime);
		if (loadTime == null) {
			console.error(Err.Settings);
			return null;
		}
		let s = new Settings(
			Number(localStorage.getItem(Varname.Settings_MessageSizeMax)),
			Number(localStorage.getItem(Varname.Settings_PasswordLengthMin)),
			Number(localStorage.getItem(Varname.Settings_PasswordLengthMax)),
		);
		Object.assign(this, s);
		return this;
	}
}

// Server's Version.
class Version {
	constructor(serverName, chatFamily, appName, appVersion, golang) {
		this.serverName = serverName;
		this.chatFamily = chatFamily;
		this.appName = appName;
		this.appVersion = appVersion;
		this.golang = golang;
	}

	fromJson(j) {
		let v = new Version(j.serverName, j.chatFamily, j.appName, j.appVersion, j.golang);
		Object.assign(this, v);
		return this;
	}

	async fetch() {
		let resp = await mc.rpc.version();
		if (resp.error != null) {
			return null;
		}
		this.fromJson(resp.result);
		console.info(Msg.VersionReceived + Msg.Dot);
		return this;
	}

	save() {
		localStorage.setItem(Varname.Version_ServerName, this.serverName.toString());
		localStorage.setItem(Varname.Version_ChatFamily, this.chatFamily.toString());
		localStorage.setItem(Varname.Version_AppName, this.appName.toString());
		localStorage.setItem(Varname.Version_AppVersion, this.appVersion.toString());
		localStorage.setItem(Varname.Version_Golang, this.golang.toString());
		return this;
	}

	load() {
		let v = new Version(
			localStorage.getItem(Varname.Version_ServerName),
			localStorage.getItem(Varname.Version_ChatFamily),
			localStorage.getItem(Varname.Version_AppName),
			localStorage.getItem(Varname.Version_AppVersion),
			localStorage.getItem(Varname.Version_Golang),
		);
		Object.assign(this, v);
		return this;
	}
}

// Front-End's Version.
class FEV {
	constructor(appName, appVersion, goVersion) {
		this.appName = appName;
		this.appVersion = appVersion;
		this.goVersion = goVersion;
	}

	fromJson(j) {
		let fev = new FEV(j.appName, j.appVersion, j.goVersion);
		Object.assign(this, fev);
		return this;
	}

	async fetch() {
		let req = new HttpRequest(mc.path.fev, HttpMethod.Get);
		let resp= await req.send();
		if (!resp.isOk) {
			console.error(ApiRequest.composeFrontEndError(resp));
			return null;
		}
		this.fromJson(resp.jsonObject.frontEndVersion);
		console.info(Msg.FEVReceived + Msg.Dot);
		return this;
	}

	save() {
		localStorage.setItem(Varname.FEV_AppName, this.appName.toString());
		localStorage.setItem(Varname.FEV_AppVersion, this.appVersion.toString());
		localStorage.setItem(Varname.FEV_GoVersion, this.goVersion.toString());
		return this;
	}

	load() {
		let fev = new FEV(
			localStorage.getItem(Varname.FEV_AppName),
			localStorage.getItem(Varname.FEV_AppVersion),
			localStorage.getItem(Varname.FEV_GoVersion),
		);
		Object.assign(this, fev);
		return this;
	}
}

class Token {
	constructor(text) {
		this.text = text;
	}

	save() {
		localStorage.setItem(Varname.Token, this.text);
		return this;
	}

	load() {
		let t = new Token(localStorage.getItem(Varname.Token));
		Object.assign(this, t);
		return this;
	}

	reset() {
		this.text = null;
		localStorage.removeItem(Varname.Token);
		return this;
	}

	isSet() {
		return (this.text != null)
	}
}

class User {
	constructor(token, isAdmin, roomId) {
		this.token = token;
		this.isAdmin = isAdmin;
		this.roomId = roomId;
	}

	async fetch() {
		// 1. Token.
		let t = new Token().load();
		if (!t.isSet()) {
			return null;
		}
		this.token = t;

		// 2. IsAdmin.
		let resp = await mc.rpc.isMeAdministrator(this.token.text);
		if (resp.hasError()) {
			// Is session outdated ?
			if (resp.error.code === RpcErrorCode.SessionIsNotFound) {
				console.log(Msg.SessionIsOutdated + Msg.Dot);
				this.resetToken();
				return null;
			}

			return null;
		}
		this.isAdmin = resp.result.isAdministrator;

		// 3. RoomId.
		let ok = await this.updateRoomId();
		if (!ok) {
			return null;
		}

		return this;
	}

	async updateRoomId() {
		let resp = await mc.rpc.getMyRoomId(this.token.text);
		if (resp.hasError()) {
			// Is session outdated ?
			if (resp.error.code === RpcErrorCode.SessionIsNotFound) {
				console.log(Msg.SessionIsOutdated + Msg.Dot);
				this.resetToken();
				return null;
			}

			return null;
		}
		this.roomId = resp.result.roomId;

		return this;
	}

	saveToken(text) {
		this.token = new Token(text).save();
	}

	resetToken() {
		this.token.reset();
	}

	async leaveCurrentRoom() {
		let roomId = mc.user.roomId;
		console.log(Msg.LeavingRoom, roomId);

		let resp = await mc.rpc.leaveRoom(mc.user.token.text, roomId);
		if (resp.hasError()) {
			return false;
		}
		let ok = await mc.user.updateRoomId();
		if (!ok) {
			return false;
		}
		return true;
	}

	async enterRoom(roomId) {
		console.log(Msg.EnteringRoom, roomId);

		let resp = await mc.rpc.enterRoom(mc.user.token.text, roomId);
		if (resp.hasError()) {
			return false;
		}
		let ok = await mc.user.updateRoomId();
		if (!ok) {
			return false;
		}
		return true;
	}
}

class Room {
	constructor(id, type, name, moderators) {
		this.id = id;
		this.type = type;
		this.name = name;
		this.moderators = moderators;
		this.activeUserIds = null;
		this.userCache = new UserCache();
		this.messages = null;
	}

	fromJson(j) {
		let r = new Room(j.id, j.type, j.name, j.moderators);
		Object.assign(this, r);
		return this;
	}

	async fetch() {
		let roomId = mc.user.roomId;
		let resp = await mc.rpc.getRoom(mc.user.token.text, roomId);
		if (resp.hasError()) {
			// Is session outdated ?
			if (resp.error.code === RpcErrorCode.SessionIsNotFound) {
				console.log(Msg.SessionIsOutdated + Msg.Dot);
				mc.user.resetToken();
				return null;
			}

			return null;
		}
		this.fromJson(resp.result.room);
		await this.initActiveUsers();
		await this.initMessages();

		return this;
	}

	async sendMessage(text) {
		if (getStringSizeInBytes(text) > mc.settings.messageSizeMax) {
			console.error(Err.MessageIsTooLong);
			return;
		}
		let resp = await mc.rpc.addMessage(mc.user.token.text, mc.room.id, text);
		if (resp.hasError()) {
			// Is session outdated ?
			if (resp.error.code === RpcErrorCode.SessionIsNotFound) {
				console.log(Msg.SessionIsOutdated + Msg.Dot);
				mc.user.resetToken();
				return null;
			}

			return null;
		}

		return resp;
	}

	async initActiveUsers() {
		this.activeUserIds = await this.fetchActiveUserIds();
	}

	async initMessages() {
		this.messages = await this.fetchAllMessages();
	}

	async refreshActiveUsers() {
		let newActiveUserIds = await this.fetchActiveUserIds();
		let x = this.findDeltas(this.activeUserIds, newActiveUserIds);
		let addedIds = x[0];
		let removedIds = x[1];
		this.activeUserIds = newActiveUserIds;
		return [addedIds, removedIds];
	}

	async refreshMessages(timeMarkTS) {
		let resp = await mc.rpc.listMessagesSince(mc.user.token.text, this.id, timeMarkTS);
		if (resp.hasError()) {
			return null;
		}
		if (resp.result.messages.roomId !== this.id) {
			console.error(Err.DatabaseIsBroken);
			return null;
		}

		let newMessages = Message.fromListOfMessages(resp.result.messages);
		this.messages.push(...newMessages);
		return newMessages;
	}

	findDeltas(oldIds, newIds) {
		let addedIds = newIds.filter(x => !oldIds.includes(x));
		let removedIds = oldIds.filter(x => !newIds.includes(x));
		return [addedIds, removedIds];
	}

	async fetchActiveUserIds() {
		let resp = await mc.rpc.getRoomUsers(mc.user.token.text, this.id);
		if (resp.hasError()) {
			return null;
		}
		if (resp.result.roomId !== this.id) {
			console.error(Err.DatabaseIsBroken);
			return null;
		}
		return resp.result.activeUserIds;
	}

	async fetchAllMessages() {
		let resp = await mc.rpc.listAllMessages(mc.user.token.text, this.id);
		if (resp.hasError()) {
			return null;
		}
		if (resp.result.messages.roomId !== this.id) {
			console.error(Err.DatabaseIsBroken);
			return null;
		}
		return Message.fromListOfMessages(resp.result.messages);
	}

	async getUser(userId) {
		return await this.userCache.getUser(userId);
	}
}

class Message {
	constructor(tocTS, authorId, text) {
		this.tocTS = tocTS;
		this.authorId = authorId;
		this.text = text;
	}

	fromDTS(SSTTS, TOCDTS, authorId, text) {
		this.tocTS = SSTTS + TOCDTS;
		this.authorId = authorId;
		this.text = text;
		return this;
	}

	static fromListOfMessages(lom) {
		let msgs = [];
		for (let i = 0; i < lom.authorIds.length; i++) {
			let msg = new Message().fromDTS(lom.SSTTS, lom.TOCDTSs[i], lom.authorIds[i], lom.contents[i]);
			// Message of the second of the read operation is ignored.
			if (msg.tocTS === lom.opTimeTS) {
				continue;
			}
			msgs.push(msg);
		}
		return msgs;
	}
}

class KeyVal {
	constructor(key, value) {
		this.key = key;
		this.value = value;
	}
}

class KeyVals {
	constructor(kvs) {
		if (!Array.isArray(kvs)) {
			console.error(Err.ArgumentMustBeAnArray);
			return;
		}
		this.kvs = kvs;
	}

	toVTable() {
		let t = newTable();
		for (const kv of this.kvs) {
			let th = newThWithText(kv.key);
			let td = newTdWithText(kv.value);
			let tr = newTr().with(th).with(td);
			t.add(tr);
		}
		return t;
	}

	toRow() {
		let tr = newTr();
		for (const kv of this.kvs) {
			let td = newTdWithText(kv.value);
			tr.add(td);
		}
		return tr;
	}

	toHRow() {
		let tr = newTr();
		for (const kv of this.kvs) {
			let th = newThWithText(kv.key);
			tr.add(th);
		}
		return tr;
	}
}

class ChatUser {
	constructor(id, name, emailAddress, registerTime, isBanned) {
		this.id = id;
		this.name = name;
		this.emailAddress = emailAddress;
		this.registerTime = registerTime;
		this.isBanned = isBanned;
	}

	fromJson(j) {
		let cu = new ChatUser(j.id, j.name, j.emailAddress, j.registerTime, j.isBanned);
		Object.assign(this, cu);
		return this;
	}

	arrayFromJson(j) {
		let xx = [];
		for (let x of j) {
			let cu = new ChatUser().fromJson(x);
			xx.push(cu);
		}
		return xx;
	}

	toKvs() {
		let kvs = [];
		kvs.push(new KeyVal("ID", this.id));
		kvs.push(new KeyVal("Name", this.name));
		kvs.push(new KeyVal("E-Mail", this.emailAddress));
		kvs.push(new KeyVal("Reg. Time", prettyTime(new Date(this.registerTime))));
		kvs.push(new KeyVal("IsBanned", this.isBanned));
		return new KeyVals(kvs);
	}

	static usersToTable(users) {
		let t = newTable().with((new ChatUser().toKvs().toHRow()));
		for (const u of users) {
			t.add(u.toKvs().toRow());
		}
		return t;
	}
}

class UserCache {
	constructor() {
		this.m = new Map();
	}

	async getUser(userId) {
		if (this.m.has(userId)) {
			return this.m.get(userId);
		}
		let ok = await this.loadUser(userId);
		if (!ok) {
			return null;
		}
		return this.m.get(userId);
	}

	async loadUser(userId) {
		if (this.m.has(userId)) {
			console.error(Err.UserIsAlreadyLoaded);
			return false;
		}

		let resp = await mc.rpc.getUser(mc.user.token.text, userId);
		if (resp.hasError()) {
			return false;
		}
		let cu = new ChatUser().fromJson(resp.result.user);
		if (cu.id !== userId) {
			console.error(Err.DatabaseIsBroken);
			return false;
		}
		this.m.set(userId, cu);
		return true;
	}
}

class Handler {
	constructor(type, fn) {
		this.type = type;
		this.fn = fn;
	}
}

function newOnClickHandler(fn) {
	return new Handler(EventType.Click, fn);
}

class Now {
	constructor() {
		this.time = Date.now();
		this.ts = Math.floor(this.time / 1000);
	}
}

class Path {
	constructor(api, settings,fev) {
		this.api = api;
		this.settings = settings;
		this.fev=fev;
	}
}

class ChatRoom {
	constructor(id, name, type, usersCount) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.usersCount = usersCount;
	}

	arrayFromJson(j) {
		let rooms = [];
		for (let r of j) {
			let room = new ChatRoom(r.id, r.nam, r.typ, r.auc);
			rooms.push(room);
		}
		return rooms;
	}

	static roomTypeName(n) {
		if (n === 1) {
			return "Public";
		} else if (n === 2) {
			return "Private";
		} else {
			return "???";
		}
	}
}

function timeFromTS(ts) {
	return new Date(ts * 1000);
}

function prettyTime(t) {
	let monthN = t.getUTCMonth() + 1; // Months in JavaScript start with 0 !

	return t.getUTCDate().toString().padStart(2, '0') + "." +
		monthN.toString().padStart(2, '0') + "." +
		t.getUTCFullYear().toString().padStart(4, '0') + " " +
		t.getUTCHours().toString().padStart(2, '0') + ":" +
		t.getUTCMinutes().toString().padStart(2, '0');
}

function getStringSizeInBytes(s) {
	let t = new TextEncoder().encode(s);
	return t.length;
}
