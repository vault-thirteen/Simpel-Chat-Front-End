/* JavaScript version ECMAScript 2017 */
/* ! JavaScript language must die ! */
/* More information at https://www.w3schools.com/js/js_versions.asp */
/* JS Compatibility Table: https://compat-table.github.io/compat-table/es2016plus/ */

let mc = new MC();
window.addEventListener(EventType.BeforeUnload, onBeforeUnload);
document.addEventListener(EventType.DOMContentLoaded, onDOMContentLoaded);

async function onBeforeUnload(event) {
	sessionStorage.setItem(Varname.IsPageReloading, "true");
	sessionStorage.setItem(Varname.PreviousPage, mc.request.page);

	// Unfortunately, JavaScript does not distinguish page closure from page
	// refresh. Burn in hell.
}

// Entry point.
async function onDOMContentLoaded(event) {
	let ok = await mc.init();
	if (!ok) {
		if ((mc.request.page !== Page.LogReg) &&
			(mc.request.page !== Page.LogIn) &&
			(mc.request.page !== Page.Register)) {
			redirect(Page.LogReg);
			return;
		}
	}
	mc.cs = new ContentSwitcher(mc.request.page);
	mc.cs.switchPage();
}

function redirect(page) {
	let newUrl = window.location.origin + "?" + QueryParameter.Page + "=" + page;
	window.location.assign(newUrl);
}
