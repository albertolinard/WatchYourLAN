export const apiPath = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://0.0.0.0:8840';

export const apiGetAllHosts = async () => {
  const url = apiPath+'/api/all';
  const hosts = await (await fetch(url)).json();

  return hosts;
};

export const apiGetConfig = async () => {

  const url = apiPath+'/api/config';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetVersion = async () => {

  const url = apiPath+'/api/version';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiTestNotify = async () => {

  const url = apiPath+'/api/notify_test';
  await fetch(url);
};

export const apiEditHost = async (id:string, name:string, toggleKnown:boolean) => {

  const url = apiPath+'/api/host/'+encodeURIComponent(id);
  const res = await (await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, toggle_known: toggleKnown }),
  })).json();

  return res;
};

export const apiGetHost = async (id:string) => {

  const url = apiPath+'/api/host/'+encodeURIComponent(id);
  const res = await (await fetch(url)).json();

  return res;
};

export const apiDelHost = async (id:string) => {

  const url = apiPath+'/api/host/'+encodeURIComponent(id);
  const res = await (await fetch(url, { method: 'DELETE' })).json();

  return res;
};

export const apiAddHost = async (mac:string, name:string, ip:string, vendor:string) => {

  const params = new URLSearchParams();
  if (name)   params.set('name', name);
  if (ip)     params.set('ip', ip);
  if (vendor) params.set('vendor', vendor);
  const qs = params.toString();

  const url = apiPath + '/api/host/add/' + encodeURIComponent(mac) + (qs ? '?' + qs : '');
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Add host failed: HTTP ' + res.status);
  }
  return res.json();
};

export const apiPortScan = async (ip:string, port:number) => {

  const url = apiPath+'/api/port/'+ip+'/'+port;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetEvents = async (mac:string) => {
  const url = apiPath+'/api/events/'+encodeURIComponent(mac)+'?num=210';
  const events = await (await fetch(url)).json();

  return events;
};

export const apiGetEventsByDate = async (mac:string, date: string) => {
  const url = apiPath+'/api/events/'+encodeURIComponent(mac)+'/'+encodeURIComponent(date);
  const events = await (await fetch(url)).json();

  return events;
};

export const apiWOL = async (mac:string) => {

  const url = apiPath+'/api/wol/'+mac;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetStatus = async () => {
  const url = apiPath+'/api/status/';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetScanState = async () => {
  const url = apiPath+'/api/scan_state';
  const res = await (await fetch(url)).json();

  return res;
};
