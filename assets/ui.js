class ContentSwitcher {
	constructor(page) {
		if (page == null) {
			page = Page.Default;
		}
		this.page = page;
		this.formName = null;
	}

	setArgs(formName) {
		this.formName = formName;
	}

	switchPage() {
		switch (this.page) {
			case Page.Main:
				this.setArgs(this.page);
				this.Main().then(() => {
				});
				break;

			case Page.LogReg:
				this.setArgs(this.page);
				this.LogReg();
				break;

			case Page.Register:
				this.setArgs(this.page);
				this.Register();
				break;

			case Page.LogIn:
				this.setArgs(this.page);
				this.LogIn();
				break;

			case Page.LogOut:
				this.setArgs(this.page);
				this.LogOut();
				break;

			case Page.ChangePassword:
				this.setArgs(this.page);
				this.ChangePassword();
				break;

			case Page.BanUser:
				this.setArgs(this.page);
				this.BanUser();
				break;

			case Page.AddRoom:
				this.setArgs(this.page);
				this.AddRoom();
				break;

			case Page.DeleteRoom:
				this.setArgs(this.page);
				this.DeleteRoom();
				break;

			case Page.Moderators:
				this.setArgs(this.page);
				this.Moderators();
				break;

			case Page.ARU:
				this.setArgs(this.page);
				this.ARU();
				break;

			case Page.ShowUser:
				this.setArgs(this.page);
				this.ShowUser();
				break;

			case Page.ListUsers:
				this.setArgs(this.page);
				this.ListUsers();
				break;

			case Page.ListRooms:
				this.setArgs(this.page);
				this.ListRooms().then(() => {
				});
				break;

			case Page.Room:
				this.setArgs(this.page);
				this.Room().then(() => {
				});
				break;

			default:
				this.PageNotFound();
				break;
		}
	}

	async Main() {
		let pc = getPC();
		clearContents(pc);

		let divTitle = newDivWithSpan("Welcome to the chat !");
		pc.appendChild(divTitle.el);

		let resp = await mc.rpc.ping();
		if (resp.hasError()) {
			return;
		}

		let fnLogOut = async function (event) {
			event.preventDefault();
			redirect(Page.LogOut);
		}.bind(this);
		let fnBan = async function (event) {
			event.preventDefault();
			redirect(Page.BanUser);
		}.bind(this);
		let fnChangePwd = async function (event) {
			event.preventDefault();
			redirect(Page.ChangePassword);
		}.bind(this);
		let fnAddRoom = async function (event) {
			event.preventDefault();
			redirect(Page.AddRoom);
		}.bind(this);
		let fnDelRoom = async function (event) {
			event.preventDefault();
			redirect(Page.DeleteRoom);
		}.bind(this);
		let fnChatRooms = async function (event) {
			event.preventDefault();
			redirect(Page.ListRooms);
		}.bind(this);
		let fnModerators = async function (event) {
			event.preventDefault();
			redirect(Page.Moderators);
		}.bind(this);
		let fnARU = async function (event) {
			event.preventDefault();
			redirect(Page.ARU);
		}.bind(this);
		let fnUser = async function (event) {
			event.preventDefault();
			redirect(Page.ShowUser);
		}.bind(this);
		let fnUsers = async function (event) {
			event.preventDefault();
			redirect(Page.ListUsers);
		}.bind(this);


		let buttonsSession = [
			new FormAButton(Page.LogOut, "Log Out", fnLogOut),
			new FormAButton(Page.ChangePassword, "Change Password", fnChangePwd),
		];
		let formSession = new FormA(this.formName + "1", "Session actions:", [], buttonsSession, false);
		let divSession = formSession.createForm();
		pc.appendChild(divSession.el);

		let buttonsUser = [
			new FormAButton(Page.ListRooms, "Chat Rooms", fnChatRooms),
			new FormAButton(Page.ShowUser, "User", fnUser),
			new FormAButton(Page.ListUsers, "Users", fnUsers),
		];
		let formUser = new FormA(this.formName + "2", "Common actions:", [], buttonsUser, false);
		let divUser = formUser.createForm();
		pc.appendChild(divUser.el);

		let buttonsModer = [
			new FormAButton(Page.ARU, "ARU", fnARU),
		];
		let formModer = new FormA(this.formName + "3", "Moderator's actions:", [], buttonsModer, false);
		let divModer = formModer.createForm();
		pc.appendChild(divModer.el);

		if (mc.user.isAdmin) {
			let buttonsAdmin = [
				new FormAButton(Page.AddRoom, "Add a Room", fnAddRoom),
				new FormAButton(Page.DeleteRoom, "Delete a Room", fnDelRoom),
				new FormAButton(Page.Moderators, "Moderators", fnModerators),
				new FormAButton(Page.BanUser, "Ban a User", fnBan),
			];
			let formAdmin = new FormA(this.formName + "4", "Administrator's actions:", [], buttonsAdmin, false);
			let divAdmin = formAdmin.createForm();
			pc.appendChild(divAdmin.el);
		}
	}

	LogReg() {
		let pc = getPC();
		clearContents(pc);

		let fnReg = async function (event) {
			event.preventDefault();
			disableForm(this.formName);
			redirect(Page.Register);
		}.bind(this);
		let fnLog = async function (event) {
			event.preventDefault();
			disableForm(this.formName);
			redirect(Page.LogIn);
		}.bind(this);
		let buttons = [
			new FormAButton("reg", "Register", fnReg),
			new FormAButton("log", "Log in", fnLog),
		];
		let form = new FormA(this.formName, "Register or log into the system", [], buttons, false);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	Register() {
		let pc = getPC();
		clearContents(pc);

		let items1 = [
			new FormAItem(InputType.Text, "email", "E-Mail"),
		];
		let fnProceed1 = async function (event) {
			event.preventDefault();
			disableForm(this.formName + "1");
			let email = getFormInputValue(this.formName + "1", "email");
			let resp = await mc.rpc.registerUser1(email);
			if (resp.hasError()) {
				return;
			}
			mc.rpc.setLastResult(resp);
			enableForm(this.formName + "2");
		}.bind(this);
		let buttons1 = [
			new FormAButton("proceed", "Proceed", fnProceed1),
		];
		let form1 = new FormA(this.formName + "1", "Register a new user. Step I.", items1, buttons1, false);
		let div1 = form1.createForm();
		pc.appendChild(div1.el);

		let items2 = [
			new FormAItem(InputType.Text, "vcode", "Verification Code"),
			new FormAItem(InputType.Text, "username", "User Name"),
			new FormAItem(InputType.Password, "pwd", "Password"),
			new FormAItem(InputType.Hint, "pwdhint", "Hint", null, composePasswordLengthHint()),
		];
		let fnProceed2 = async function (event) {
			event.preventDefault();
			let lar = mc.rpc.getLastResult();
			let email = getFormInputValue(this.formName + "1", "email");
			let requestId = lar.requestId;
			let verificationCode = getFormInputValue(this.formName + "2", "vcode");
			let userName = getFormInputValue(this.formName + "2", "username");
			let userPassword = getFormInputValue(this.formName + "2", "pwd");
			disableForm(this.formName + "2");
			let resp = await mc.rpc.registerUser2(email, requestId, verificationCode, userName, userPassword);
			enableForm(this.formName + "2");
			if (resp.hasError()) {
				return;
			}
			disableForm(this.formName + "2");
			redirect(Page.LogReg);
		}.bind(this);
		let buttons2 = [
			new FormAButton("proceed", "Proceed", fnProceed2),
		];
		let form2 = new FormA(this.formName + "2", "Register a new user. Step II.", items2, buttons2, false);
		let div2 = form2.createForm();
		pc.appendChild(div2.el);

		disableForm(this.formName + "2");
	}

	LogIn() {
		let pc = getPC();
		clearContents(pc);

		let items1 = [
			new FormAItem(InputType.Text, "email", "E-Mail"),
		];
		let fnProceed1 = async function (event) {
			event.preventDefault();
			disableForm(this.formName + "1");
			let email = getFormInputValue(this.formName + "1", "email");
			let resp = await mc.rpc.logIn1(email);
			if (resp.hasError()) {
				return;
			}
			mc.rpc.setLastResult(resp);
			enableForm(this.formName + "2");
		}.bind(this);
		let buttons1 = [
			new FormAButton("proceed", "Proceed", fnProceed1),
		];
		let form1 = new FormA(this.formName + "1", "Log into the system. Step I.", items1, buttons1, false);
		let div1 = form1.createForm();
		pc.appendChild(div1.el);

		let items2 = [
			new FormAItem(InputType.Text, "vcode", "Verification Code"),
			new FormAItem(InputType.Password, "pwd", "Password"),
		];
		let fnProceed2 = async function (event) {
			event.preventDefault();
			let lar = mc.rpc.getLastResult();
			let email = getFormInputValue(this.formName + "1", "email");
			let requestId = lar.requestId;
			let verificationCode = getFormInputValue(this.formName + "2", "vcode");
			let userPassword = getFormInputValue(this.formName + "2", "pwd");
			disableForm(this.formName + "2");
			let resp = await mc.rpc.logIn2(email, requestId, verificationCode, userPassword);
			enableForm(this.formName + "2");
			if (resp.hasError()) {
				return;
			}
			disableForm(this.formName + "2");
			mc.user.saveToken(resp.result.token);
			redirect(Page.Main);
		}.bind(this);
		let buttons2 = [
			new FormAButton("proceed", "Proceed", fnProceed2),
		];
		let form2 = new FormA(this.formName + "2", "Log into the system. Step II.", items2, buttons2, false);
		let div2 = form2.createForm();
		pc.appendChild(div2.el);

		disableForm(this.formName + "2");
	}

	LogOut() {
		let pc = getPC();
		clearContents(pc);

		let items = [];
		let fnProceed = async function (event) {
			// Part I.
			event.preventDefault();
			disableForm(this.formName);
			let resp1 = await mc.rpc.logOut1(mc.user.token.text);
			if (resp1.hasError()) {
				return;
			}
			mc.rpc.setLastResult(resp1);

			// Part II.
			let lar = mc.rpc.getLastResult();
			let requestId = lar.requestId;
			let resp2 = await mc.rpc.logOut2(mc.user.token.text, requestId);
			if (resp2.hasError()) {
				return;
			}
			mc.user.resetToken();
			redirect(Page.LogReg);
		}.bind(this);
		let buttons = [
			new FormAButton("proceed", "Proceed", fnProceed),
		];
		let form = new FormA(this.formName, "Log out of the system.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	ChangePassword() {
		let pc = getPC();
		clearContents(pc);

		let items1 = [];
		let fnProceed1 = async function (event) {
			event.preventDefault();
			disableForm(this.formName + "1");
			let resp = await mc.rpc.changePassword1(mc.user.token.text);
			if (resp.hasError()) {
				return;
			}
			mc.rpc.setLastResult(resp);
			enableForm(this.formName + "2");
		}.bind(this);
		let buttons1 = [
			new FormAButton("proceed", "Proceed", fnProceed1),
		];
		let form1 = new FormA(this.formName + "1", "Change password. Step I.", items1, buttons1, true);
		let div1 = form1.createForm();
		pc.appendChild(div1.el);

		let items2 = [
			new FormAItem(InputType.Text, "vcode", "Verification Code"),
			new FormAItem(InputType.Password, "pwd", "Password"),
			new FormAItem(InputType.Password, "newpwd1", "New Password"),
			new FormAItem(InputType.Password, "newpwd2", "New Password"),
			new FormAItem(InputType.Hint, "pwdhint", "Hint", null, composePasswordLengthHint()),
		];
		let fnProceed2 = async function (event) {
			event.preventDefault();
			let lar = mc.rpc.getLastResult();
			let requestId = lar.requestId;
			let verificationCode = getFormInputValue(this.formName + "2", "vcode");
			let userPassword = getFormInputValue(this.formName + "2", "pwd");
			let newUserPassword1 = getFormInputValue(this.formName + "2", "newpwd1");
			let newUserPassword2 = getFormInputValue(this.formName + "2", "newpwd2");
			disableForm(this.formName + "2");
			let resp = await mc.rpc.changePassword2(mc.user.token.text, requestId, verificationCode, userPassword, newUserPassword1, newUserPassword2);
			enableForm(this.formName + "2");
			if (resp.hasError()) {
				return;
			}
			disableForm(this.formName + "2");
			mc.user.resetToken();
			redirect(Page.LogReg);
		}.bind(this);
		let buttons2 = [
			new FormAButton("proceed", "Proceed", fnProceed2),
		];
		let form2 = new FormA(this.formName + "2", "Change password. Step II.", items2, buttons2, false);
		let div2 = form2.createForm();
		pc.appendChild(div2.el);

		disableForm(this.formName + "2");
	}

	BanUser() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "userid", "User ID"),
		];
		let fnProceed = async function (event) {
			event.preventDefault();
			disableForm(this.formName);
			let userId = Number(getFormInputValue(this.formName, "userid"));
			let resp = await mc.rpc.banUser(mc.user.token.text, userId);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.banUser(userId));
			enableForm(this.formName);
		}.bind(this);
		let buttons = [
			new FormAButton("proceed", "Proceed", fnProceed),
		];
		let form = new FormA(this.formName, "Ban a user.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	AddRoom() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Select, "roomtype", "Room Type", null, ["Public", "Private"]),
			new FormAItem(InputType.Text, "roomname", "Room Name"),
		];
		let fnProceed = async function (event) {
			event.preventDefault();
			disableForm(this.formName);
			let roomType = Number(getFormInputValue(this.formName, "roomtype"));
			let roomName = getFormInputValue(this.formName, "roomname");
			let resp = await mc.rpc.addRoom(mc.user.token.text, roomType, roomName);
			if (resp.hasError()) {
				return;
			}
			let roomId = resp.result.roomId;
			console.info(Info.addRoom(roomId));
			enableForm(this.formName);
		}.bind(this);
		let buttons = [
			new FormAButton("proceed", "Proceed", fnProceed),
		];
		let form = new FormA(this.formName, "Add a room.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	DeleteRoom() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "roomid", "Room ID"),
		];
		let fnProceed = async function (event) {
			event.preventDefault();
			disableForm(this.formName);
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			let resp = await mc.rpc.deleteRoom(mc.user.token.text, roomId);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.deleteRoom(roomId));
			enableForm(this.formName);
		}.bind(this);
		let buttons = [
			new FormAButton("proceed", "Proceed", fnProceed),
		];
		let form = new FormA(this.formName, "Delete a room.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	async ListRooms() {
		let pc = getPC();
		clearContents(pc);

		let form = new FormA("rooms", "List of all chat rooms.", [], [], true);
		let div = form.createForm();
		pc.appendChild(div.el);
		let divCurrentRoom = makeDiv_CurrentRoom(mc.user.roomId);
		pc.appendChild(divCurrentRoom.el);

		let resp = await mc.rpc.listRooms(mc.user.token.text);
		if (resp.hasError()) {
			return;
		}
		let rooms = new ChatRoom().arrayFromJson(resp.result.rooms);
		let cr = new FormC("roomsData", rooms);
		div = cr.createForm();
		pc.appendChild(div.el);
	}

	async Room() {
		let pc = getPC();
		clearContents(pc);

		let form = new FormD();
		let xx = await form.createForm();
		if (xx == null) {
			return;
		}
		for (let x of xx) {
			pc.appendChild(x.el);
		}
		await form.initData();
		form.startTimers();
	}

	Moderators() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "roomid", "Room ID"),
			new FormAItem(InputType.Text, "userid", "User ID"),
			new FormAItem(InputType.Textarea, "userids", "User IDs"),
		];
		let fnList = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			disableForm(this.formName);
			let resp = await mc.rpc.listRoomModerators(mc.user.token.text, roomId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			let userIds = resp.result.userIds;
			getFormInput(this.formName, "userids").value = JSON.stringify(userIds);
		}.bind(this);
		let fnAdd = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			let userId = Number(getFormInputValue(this.formName, "userid"));
			disableForm(this.formName);
			let resp = await mc.rpc.addRoomModerator(mc.user.token.text, roomId, userId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.addRoomModerator(userId, roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let fnRemove = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			let userId = Number(getFormInputValue(this.formName, "userid"));
			disableForm(this.formName);
			let resp = await mc.rpc.deleteRoomModerator(mc.user.token.text, roomId, userId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.deleteRoomModerator(userId, roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let fnReset = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			disableForm(this.formName);
			let resp = await mc.rpc.resetRoomModerators(mc.user.token.text, roomId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.resetRoomModerators(roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let buttons = [
			new FormAButton("list", "List Moderators", fnList),
			new FormAButton("add", "Add Moderator", fnAdd),
			new FormAButton("remove", "Remove Moderator", fnRemove),
			new FormAButton("reset", "Reset Moderators", fnReset),
		];
		let form = new FormA(this.formName, "Room Moderators.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	ARU() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "roomid", "Room ID"),
			new FormAItem(InputType.Text, "userid", "User ID"),
			new FormAItem(InputType.Textarea, "userids", "User IDs"),
		];
		let fnList = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			disableForm(this.formName);
			let resp = await mc.rpc.listAllowedRoomUsers(mc.user.token.text, roomId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			let userIds = resp.result.userIds;
			getFormInput(this.formName, "userids").value = JSON.stringify(userIds);
		}.bind(this);
		let fnAdd = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			let userId = Number(getFormInputValue(this.formName, "userid"));
			disableForm(this.formName);
			let resp = await mc.rpc.addAllowedRoomUser(mc.user.token.text, roomId, userId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.addAllowedRoomUser(userId, roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let fnRemove = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			let userId = Number(getFormInputValue(this.formName, "userid"));
			disableForm(this.formName);
			let resp = await mc.rpc.deleteAllowedRoomUser(mc.user.token.text, roomId, userId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.deleteAllowedRoomUser(userId, roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let fnReset = async function (event) {
			event.preventDefault();
			let roomId = Number(getFormInputValue(this.formName, "roomid"));
			disableForm(this.formName);
			let resp = await mc.rpc.resetAllowedRoomUsers(mc.user.token.text, roomId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			console.info(Info.resetAllowedRoomUsers(roomId));
			getFormInput(this.formName, "list").click();
		}.bind(this);
		let buttons = [
			new FormAButton("list", "List Allowed Room Users", fnList),
			new FormAButton("add", "Add Allowed Room User", fnAdd),
			new FormAButton("remove", "Remove Allowed Room User", fnRemove),
			new FormAButton("reset", "Reset Allowed Room Users", fnReset),
		];
		let form = new FormA(this.formName, "List of allowed users.", items, buttons, true);
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	ShowUser() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "userid", "User ID"),
		];
		let fnShow = async function (event) {
			event.preventDefault();
			let userId = Number(getFormInputValue(this.formName, "userid"));
			disableForm(this.formName);
			let resp = await mc.rpc.getUser(mc.user.token.text, userId);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			let cu = new ChatUser().fromJson(resp.result.user);
			let divInfo = getEl(FormB.ID.info);
			clearContents(divInfo);
			divInfo.appendChild(cu.toKvs().toVTable().el);
		}.bind(this);
		let buttons = [
			new FormAButton("show", "Show", fnShow),
		];
		let form = new FormB(this.formName, "Show User.", items, buttons, true, "User's Information");
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	ListUsers() {
		let pc = getPC();
		clearContents(pc);

		let items = [
			new FormAItem(InputType.Text, "pageSize", "Page Size", 10),
			new FormAItem(InputType.Text, "pageNumber", "Page Number", 1),
		];
		let fnShow = async function (event) {
			event.preventDefault();
			let pageSize = Number(getFormInputValue(this.formName, "pageSize"));
			let pageNumber = Number(getFormInputValue(this.formName, "pageNumber"));
			disableForm(this.formName);
			let resp = await mc.rpc.listUsers(mc.user.token.text, pageSize, pageNumber);
			enableForm(this.formName);
			if (resp.hasError()) {
				return;
			}
			let cus = new ChatUser().arrayFromJson(resp.result.users);
			let divInfo = getEl(FormB.ID.info);
			clearContents(divInfo);
			divInfo.appendChild(ChatUser.usersToTable(cus).el);
		}.bind(this);
		let fnPrev = async function (event) {
			event.preventDefault();
			let pageNumber = Number(getFormInputValue(this.formName, "pageNumber"));
			getFormInput(this.formName, "pageNumber").value = pageNumber - 1;
			getFormInput(this.formName, "show").click();
		}.bind(this);
		let fnNext = async function (event) {
			event.preventDefault();
			let pageNumber = Number(getFormInputValue(this.formName, "pageNumber"));
			getFormInput(this.formName, "pageNumber").value = pageNumber + 1;
			getFormInput(this.formName, "show").click();
		}.bind(this);
		let buttons = [
			new FormAButton("show", "Show", fnShow),
			new FormAButton("prev", "Previous", fnPrev),
			new FormAButton("next", "Next", fnNext),
		];
		let form = new FormB(this.formName, "List Users.", items, buttons, true, "Users on Page");
		let div = form.createForm();
		pc.appendChild(div.el);
	}

	PageNotFound() {
		let pc = getPC();
		clearContents(pc);

		let div = makeDiv_PageNotFound();
		pc.appendChild(div.el);
	}
}

// Hacks for ancient HTML bugs !
const CssClass = {
	MinWidth: "min-width",
}

// UI elements.
const UIE = {
	PageHeader: "pageHeader",
	PageContent: "pageContent",
	PageFooter: "pageFooter",
}

const InputType = {
	Button: "button",
	Password: "password",
	Text: "text",
	Select: "select",
	Textarea: "textarea",
	Hint: "hint",
}

const ButtonText = {
	Back: "Go Back",
}

const EventType = {
	Load: "load",
	DOMContentLoaded: "DOMContentLoaded",
	BeforeUnload: "beforeunload",
	Unload: "unload",
	Click: "click",
}

// Basic functions.

function getEl(id) {
	return document.getElementById(id);
}

function getForm(formId) {
	return getEl(formId);
}

function getFormInput(formId, inputName) {
	return getForm(formId).elements[inputName];
}

function getFormInputValue(formId, inputName) {
	return getFormInput(formId, inputName).value;
}

function getPC() {
	return getEl(UIE.PageContent)
}

function getPH() {
	return getEl(UIE.PageHeader)
}

function getPF() {
	return getEl(UIE.PageFooter)
}

function clearContents(el) {
	el.innerHTML = "";
}

function disableForm(formId) {
	let f = getForm(formId);

	for (let e of f.elements) {
		e.disabled = true;
	}
}

function enableForm(formId) {
	let f = getForm(formId);

	for (let e of f.elements) {
		e.disabled = false;
	}
}

// Basic elements.

class Element {
	constructor(tagName, className, id, text) {
		this.el = document.createElement(tagName);

		if (className != null) {
			this.el.className = className;
		}
		if (id != null) {
			this.el.id = id;
		}
		if (text != null) {
			this.el.textContent = text;
		}
	}

	fromExistingNode(htmlNode) {
		this.el = htmlNode;
		return this;
	}

	with(arg) {
		if (Array.isArray(arg)) {
			for (const x of arg) {
				this.addChild(x);
			}
		} else {
			this.addChild(arg);
		}
		return this;
	}

	addChild(ch) {
		switch (true) {
			case ch instanceof Element:
				this.el.appendChild(ch.el);
				break;

			default:
				this.el.appendChild(ch);
				break;
		}
	}

	add(arg) {
		return this.with(arg);
	}
}

function newDiv(className, id, text) {
	return new Element("div", className, id, text);
}

function newDivWithSpan(text, className) {
	let span = newSpanWithText(text);
	return newDiv(className).with(span);
}

function newSpan(className, id, text) {
	return new Element("span", className, id, text);
}

function newSpanWithText(text) {
	return newSpan(null, null, text);
}

function newTable(className, id, text) {
	return new Element("table", className, id, text);
}

function newTr(className, id, text) {
	return new Element("tr", className, id, text);
}

function newTd(className, id, text, colSpan) {
	let td = new Element("td", className, id, text);

	if (colSpan != null) {
		td.el.colSpan = colSpan;
	}

	return td;
}

function newTdWithText(text) {
	return newTd(null, null, text);
}

function newTdWithColSpan(colSpan) {
	return newTd(null, null, null, colSpan);
}

function newTh(className, id, text) {
	return new Element("th", className, id, text);
}

function newThWithText(text) {
	return newTh(null, null, text);
}

function newForm(className, id, text) {
	return new Element("form", className, id, text);
}

function newLabel(className, id, text) {
	return new Element("label", className, id, text);
}

function newLabelWithText(text) {
	return newLabel(null, null, text);
}

function newInput(className, id, type, name, value, placeholder, handlers) {
	let inp = new Element("input", className, id);

	inp.el.type = type;
	inp.el.name = name;

	if (value != null) {
		inp.el.value = value;
	}

	if (placeholder != null) {
		inp.el.placeholder = placeholder;
	}

	if (handlers != null) {
		for (const h of handlers) {
			inp.el.addEventListener(h.type, h.fn);
		}
	}

	return inp;
}

function newTextarea(className, id, name, isReadOnly, value) {
	let ta = new Element("textarea", className, id);

	ta.el.name = name;

	if (isReadOnly != null) {
		ta.el.readOnly = isReadOnly;
	}

	if (value != null) {
		ta.el.value = value;
	}

	return ta;
}

function newSelect(className, id, name, options) {
	let sel = new Element("select", className, id);

	sel.el.name = name;

	if (options != null) {
		for (const o of options) {
			sel.add(o);
		}
	}

	return sel;
}

function newOption(value, text) {
	let opt = new Element("option");
	opt.el.value = value;
	opt.el.textContent = text;
	return opt;
}

function stringsToOptions(strings) {
	let opts = [];

	let n = 1;
	for (const s of strings) {
		let opt = newOption(n, s);
		opts.push(opt);
		n++;
	}

	return opts;
}

// Fast element constructors.

function newTitleRow(text, colSpan) {
	let title = newSpanWithText(text);

	if (colSpan == null) {
		return newTr().with(newTd().with(title));
	}

	return newTr().with(newTdWithColSpan(colSpan).with(title));
}

function makeDiv_CurrentRoom(roomId) {
	let txt = "Your current room: " + ((roomId == null) ? "none" : roomId.toString()) + ".";
	return newDivWithSpan(txt, ClassNames.CurrentRoomIndicator);
}

function makeDiv_PageNotFound() {
	let txt = "The requested page does not exist.";
	return newDivWithSpan(txt, ClassNames.PageNotFound);
}

// Forms.

class FormA {
	constructor(className, title, items, buttons, addBackToMain) {
		this.className = className;
		this.title = title;
		this.items = items;
		this.buttons = buttons;
		this.addBackToMain = addBackToMain;
	}

	createForm() {
		let tbl = newTable();
		let form = newForm(null, this.className).with(tbl);
		let div = newDiv(this.className).with(form);
		if (this.addBackToMain) {
			let fnBack = async function (event) {
				event.preventDefault();
				redirect(Page.Main);
			};
			let btnBack = newInput(null, null, InputType.Button, "back", ButtonText.Back, null, [newOnClickHandler(fnBack)]);
			tbl.add(newTr().with(newTdWithColSpan(2).with(btnBack)));
		}
		tbl.add(newTitleRow(this.title, 2));
		for (let item of this.items) {
			let td2;
			switch (item.type) {
				case InputType.Button:
				case InputType.Password:
				case InputType.Text:
					td2 = newTd().with(newInput(null, null, item.type, item.name, item.defaultValue, item.label));
					break;
				case InputType.Select:
					td2 = newTd().with(newSelect(null, null, item.name, stringsToOptions(item.data)));
					break;
				case InputType.Textarea:
					td2 = newTd().with(newTextarea(null, null, item.name, true));
					break;
				case InputType.Hint:
					td2 = newTd().with(newSpan("hint", null, item.data));
					break;
				default:
					td2 = newTd();
					break;
			}
			let td1 = newTd(CssClass.MinWidth).with(newLabelWithText(item.label));
			tbl.add(newTr().with(td1).with(td2));
		}
		if (this.buttons.length > 0) {
			let td = newTdWithColSpan(2);
			for (let b of this.buttons) {
				let btn = newInput(null, null, InputType.Button, b.name, b.text, null, [newOnClickHandler(b.fn)]);
				td.add(btn);
			}
			tbl.add(newTr().with(td));
		}

		return div;
	}
}

class FormAItem {
	constructor(type, name, label, defaultValue, data) {
		this.type = type;
		this.name = name;
		this.label = label;
		this.defaultValue = defaultValue;
		this.data = data;
	}
}

class FormAButton {
	constructor(name, text, fn) {
		this.name = name;
		this.text = text;
		this.fn = fn;
	}
}

class FormB extends FormA {
	constructor(className, title, items, buttons, addBackToMain, subTitle) {
		super(className, title, items, buttons, addBackToMain);
		this.subTitle = subTitle;
	}

	static ID = {
		info: "info",
	}

	createForm() {
		let div = super.createForm();
		let tbl = new Element().fromExistingNode(div.el.firstChild.firstChild);
		tbl.add(newTitleRow(this.subTitle, 2));
		tbl.add(newTr().with(newTd(FormB.ID.info, FormB.ID.info, null, 2)));

		return div;
	}
}

class FormC {
	constructor(className, rooms) {
		this.className = className;
		this.rooms = rooms;
	}

	createForm() {
		let tbl = newTable();
		let form = newForm(null, this.className).with(tbl);
		let div = newDiv(this.className).with(form);

		// Title row.
		let tr = newTr().with(newThWithText("ID")).with(newThWithText("Name")).with(newThWithText("Type")).with(newThWithText("Users")).with(newThWithText("Actions"));
		tbl.add(tr);

		// Data rows.
		for (let room of this.rooms) {
			tr = newTr().with(newTdWithText(room.id)).with(newTdWithText(room.name)).with(newTdWithText(ChatRoom.roomTypeName(room.type))).with(newTdWithText(room.usersCount));

			let td = newTd()

			let fnEnter = async function (event) {
				let callerBtn = event.currentTarget;
				callerBtn.disabled = true;
				let ok = await mc.user.enterRoom(room.id);
				if (!ok) {
					return;
				}
				redirect(Page.Room);
			};
			let inpEnter = newInput(null, null, InputType.Button, "enter", " Enter ", null, [newOnClickHandler(fnEnter)]);
			td.add(inpEnter);

			td.add(newSpan(null, null, " "));

			let fnOpen = async function (event) {
				redirect(Page.Room);
			};
			let inpOpen = newInput(null, null, InputType.Button, "open", " Open ", null, [newOnClickHandler(fnOpen)]);
			td.add(inpOpen);

			tr.add(td);
			tbl.add(tr);
		}

		return div;
	}
}

class FormD {
	constructor() {
		this.timer = null;
		this.lastUpdateTime = null;
	}

	async createForm() {
		mc.room = await new Room().fetch();
		if (mc.room == null) {
			return null;
		}

		// Quit button row.
		let divA = newDiv("roomname");
		let form = newForm(null, "quit");
		let fnQuit = async function () {
			disableForm("quit");
			let ok = await mc.user.leaveCurrentRoom();
			if (!ok) {
				return;
			}
			redirect(Page.ListRooms);
		}.bind(this);
		let btnQuit = newInput("quit", null, InputType.Button, "quit", "Quit", null, [newOnClickHandler(fnQuit)]);
		let lbl = newLabelWithText("Room: ");
		let txt = "(" + mc.room.id + ") " + mc.room.name;
		let spanRoomName = newSpan("roomname", null, txt);
		divA.add(form.add(btnQuit).add(lbl).add(spanRoomName));

		// New message row.
		let divB = newDiv("newmsg");
		form = newForm(null, "newmsg");
		lbl = newLabelWithText("New Message: ");
		let inpNewMsg = newInput("newmsg", null, InputType.Text, "newmsg", null, "New Message");
		let fnSend = async function () {
			disableForm("newmsg");
			let text = getFormInputValue("newmsg", "newmsg");
			let resp = await mc.room.sendMessage(text);
			enableForm("newmsg");
			if (resp.hasError()) {
				return;
			}
			getFormInput("newmsg", "newmsg").value = "";
		}.bind(this);
		let btnSend = newInput("send", null, InputType.Button, "send", "Send", null, [newOnClickHandler(fnSend)]);
		divB.add(form.add(lbl).add(inpNewMsg).add(btnSend));

		// Users & Messages.
		let divC = newDiv("unm");
		let tbl = newTable();
		let tr = newTr();

		// Users.
		let td1 = newTd("userlist");
		let divC1 = newDiv("c1", "c1");
		let divC1H = newDiv("c1h", "ulh", this.composeUsersCountText(0));
		let divC1T = newDiv("c1t", "c1t");
		let th1 = newTh(null, null, "ID");
		let th2 = newTh(null, null, "Name");
		let trH = newTr().with(th1).with(th2);
		let tableULT = newTable("ult", "ult").with(trH);
		divC1T.add(tableULT);
		divC1.add(divC1H).add(divC1T);
		td1.add(divC1);
		tr.add(td1);

		// Messages.
		let td2 = newTd("messagelist");
		let divC2 = newDiv("c2", "c2");
		let divC2H = newDiv("c2h", null, "Messages");
		let divC2T = newDiv("c2t", "c2t");
		let tableMLT = newTable("mlt", "mlt");
		divC2T.add(tableMLT);
		divC2.add(divC2H).add(divC2T);
		td2.add(divC2);
		tr.add(td2);
		tbl.add(tr);
		divC.add(tbl);

		return [divA, divB, divC];
	}

	async initData() {
		for (let auid of mc.room.activeUserIds) {
			let cu = await mc.room.getUser(auid);
			this.addUser(cu);
		}

		for (let msg of mc.room.messages) {
			await this.addMessage(msg);
		}

		this.lastUpdateTime = new Now();
	}

	startTimers() {
		this.timer = setInterval(async () => {
			await this.updateForm();
		}, mc.settings.roomUpdateIntervalMs);
	}

	stopTimers() {
		clearInterval(this.timer);
	}

	async updateForm() {
		let newUsersCount = await this.refreshUsers();
		let newMessagesCount = await this.refreshMessages();

		if (newUsersCount > 0) {
			let divC1T = getEl("c1t");
			let opt1 = {top: divC1T.scrollHeight, behavior: "smooth"};
			divC1T.scrollTo(opt1);
		}

		if (newMessagesCount > 0) {
			let divC2T = getEl("c2t");
			let opt2 = {top: divC2T.scrollHeight, behavior: "smooth"};
			divC2T.scrollTo(opt2)
		}

		let divULH = getEl("ulh");
		let usersCount = mc.room.activeUserIds.length;
		divULH.textContent = this.composeUsersCountText(usersCount);
	}

	addUser(chatUser) {
		let td1 = newTd(null, null, chatUser.id);
		let td2 = newTd(null, null, chatUser.name);
		let tr = newTr().with(td1).with(td2);
		getEl("ult").appendChild(tr.el);
	}

	removeUser(userId) {
		let tbl = getEl("ult");
		for (let i = 0; i < tbl.rows.length; i++) {
			let tr = tbl.rows[i];
			let td = tr.firstChild;
			if (td.textContent === userId.toString()) {
				tbl.deleteRow(i);
				return;
			}
		}
	}

	async refreshUsers() {
		let x = await mc.room.refreshActiveUsers();
		let addedIds = x[0];
		let removedIds = x[1];

		for (let addedId of addedIds) {
			let cu = await mc.room.getUser(addedId);
			this.addUser(cu);
		}

		for (let removedId of removedIds) {
			let cu = await mc.room.getUser(removedId);
			this.removeUser(cu.id);
		}

		return addedIds.length;
	}

	async refreshMessages() {
		let timeMarkTS = this.lastUpdateTime.ts;
		let newMessages = await mc.room.refreshMessages(timeMarkTS);
		this.lastUpdateTime = new Now();

		for (let msg of newMessages) {
			await this.addMessage(msg);
		}

		return newMessages.length;
	}

	async addMessage(msg) {
		let cu = await mc.room.getUser(msg.authorId);
		let userName = cu.name;
		let time = prettyTime(timeFromTS(msg.tocTS));
		let span1 = newSpan("author", null, "Author: ");
		let span2 = newSpan("author2", null, userName);
		let span3 = newSpan("date", null, " Date: ");
		let span4 = newSpan("date2", null, time);
		let trHeader = newTr("msgh").with(newTd().with(span1).with(span2).with(span3).with(span4));
		let span5 = newSpan("msgtext", null, msg.text);
		let trText = newTr().with(newTd().with(span5));
		let tableMsg = newTable("msg").with(trHeader).with(trText);
		let tr = newTr().with(newTd().with(tableMsg));
		getEl("mlt").appendChild(tr.el);
	}

	composeUsersCountText(count) {
		if (count === 0) {
			return "Users";
		} else {
			return "Users (" + count.toString() + ")";
		}
	}
}

// Other.

function initHeaderAndFooter() {
	let headerTd = getPH();
	clearContents(headerTd);
	let hdr = newDiv("header").with(newSpanWithText(mc.version.serverName));
	headerTd.appendChild(hdr.el);

	let footerTd = getPF();
	clearContents(footerTd);
	let txt = mc.version.chatFamily + " (" + mc.version.appName + " " +
		mc.version.appVersion + ", " + mc.version.golang + ").";


	let ftr = newDiv("footer").with(newSpanWithText(txt));
	footerTd.appendChild(ftr.el);
}

function composePasswordLengthHint() {
	return "Password's length must be within interval: from " + mc.settings.passwordLengthMin + " to " + mc.settings.passwordLengthMax + ".";
}
