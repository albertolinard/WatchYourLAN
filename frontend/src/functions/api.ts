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

export const apiEditHost = async (id:number, name:string, known:string) => {

  const url = apiPath+'/api/edit/'+id+'/'+name+'/'+known;
  const res = await (await fetch(url, { method: 'PUT' })).json();

  return res;
};

export const apiGetHost = async (id:string) => {

  const url = apiPath+'/api/host/'+id;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiDelHost = async (id:number) => {

  const url = apiPath+'/api/host/del/'+id;
  const res = await (await fetch(url, { method: 'DELETE' })).json();

  return res;
};

export const apiAddHost = async (mac:string, name:string, ip:string, hw:string) => {

  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (ip)   params.set('ip', ip);
  if (hw)   params.set('hw', hw);
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

export const apiGetHistory = async (mac:string) => {
  const url = apiPath+'/api/history/'+mac+'/?num=210';
  const hosts = await (await fetch(url)).json();

  return hosts;
};

export const apiGetHistoryByDate = async (mac:string, date: string) => {
  const url = apiPath+'/api/history/'+mac+'/'+date;
  const hosts = await (await fetch(url)).json();

  return hosts;
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