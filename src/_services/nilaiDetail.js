

import api from "../_api"; // sesuaikan path


/**
* GET /kelas/{kelas_id}/struktur-nilai/mapel/{mapel_id}/semester/{semester_id}
*/
export async function getStrukturByMapelSemester(kelasId, mapelId, semesterId) {
const url = `/kelas/${kelasId}/struktur-nilai/mapel/${mapelId}/semester/${semesterId}`;
const res = await api.get(url);
return res.data;
}


/**
* GET /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail
*/
export async function getNilaiDetail(kelasId, strukturId) {
const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail`;
const res = await api.get(url);
return res.data;
}


/**
* POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail/bulk
* payload: { data: [ { siswa_id, nilai_data: { lmX: { kolY: value } } } ] }
*/
export async function postNilaiDetailBulk(kelasId, strukturId, payload) {
const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/bulk`;
const res = await api.post(url, payload);
return res.data;
}


/**
* POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/generate-nilai-akhir
*/
export async function generateNilaiAkhir(kelasId, strukturId) {
const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/generate-nilai-akhir`;
const res = await api.post(url);
return res.data;
}


export default {
getStrukturByMapelSemester,
getNilaiDetail,
postNilaiDetailBulk,
generateNilaiAkhir,
};