import React, { useState } from 'react';
import { BookOpen, Users, GraduationCap, School, ChevronRight, Home, Menu, X, Search } from 'lucide-react';
import helperImages from '../assets/helper';

const HelpDocumentation = () => {
  const [activeRole, setActiveRole] = useState('home');
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Warna untuk setiap role
  const roleColors = {
    murid: {
      bg: 'bg-blue-600',
      from: 'from-blue-600',
      to: 'to-blue-700',
      light: 'bg-blue-100',
      text: 'text-blue-600'
    },
    guru: {
      bg: 'bg-green-600',
      from: 'from-green-600',
      to: 'to-green-700',
      light: 'bg-green-100',
      text: 'text-green-600'
    },
    admin: {
      bg: 'bg-purple-600',
      from: 'from-purple-600',
      to: 'to-purple-700',
      light: 'bg-purple-100',
      text: 'text-purple-600'
    }
  };

  // Tutorial data structure
  const tutorials = {
    murid: {
      title: 'Panduan Murid',
      icon: GraduationCap,
      color: roleColors.murid,
      sections: [
        {
          id: 'login-murid',
          title: 'Cara Login',
          steps: [
            {
              title: 'Buka Halaman Login',
              description: 'Akses website LMS dan klik tombol "Login Murid"',
              image: helperImages['./login-siswa1.png']
            },
            {
              title: 'Pilih Kelas',
              description: 'Pilih kelas Anda dari dropdown yang tersedia',
              image: helperImages['./login-siswa2.png']
            },
            {
              title: 'Pilih Nama',
              description: 'Cari dan pilih nama Anda dari daftar siswa',
              image: helperImages['./login-siswa3.png']
            },
            {
              title: 'Masukkan Password',
              description: 'Ketik password yang telah diberikan oleh guru, lalu klik "Masuk"',
              image: helperImages['./login-siswa4.png']
            }
          ]
        },
        {
          id: 'jadwal-murid',
          title: 'Melihat Jadwal Pelajaran',
          steps: [
            {
              title: 'Akses Menu Jadwal',
              description: 'Klik menu "Jadwal" di sidebar atau navigation bar',
              image: helperImages['./jadwal-siswa1.png']
            },
            {
              title: 'Lihat Jadwal Harian',
              description: 'Jadwal ditampilkan per hari. Anda bisa melihat mata pelajaran dan jam pelajaran setiap hari',
              image: helperImages['./jadwal-siswa2.png']
            },
            {
              title: 'Cetak Jadwal',
              description: 'Klik tombol "Cetak" untuk mencetak jadwal pelajaran Anda',
              image: helperImages['./jadwal-siswa3.png']
            }
          ]
        }
      ]
    },
    guru: {
      title: 'Panduan Guru',
      icon: Users,
      color: roleColors.guru,
      sections: [
        {
          id: 'login-guru',
          title: 'Cara Login Guru',
          steps: [
            {
              title: 'Masukkan Kredensial',
              description: 'Masukkan email dan password yang telah diberikan oleh admin',
              image: helperImages['./login-guru1.png']
            }
          ]
        },
        {
          id: 'struktur-nilai',
          title: 'Membuat Struktur Nilai',
          steps: [
            {
              title: 'Akses Menu Struktur Nilai',
              description: 'Dari dashboard, klik "Buat Struktur Nilai" atau akses menu Struktur Nilai',
              image: helperImages['./struktur-nilai1.png']
            },
            {
              title: 'Pilih Kelas dan Semester',
              description: 'Pilih kelas yang Anda ampu dan semester aktif',
              image: helperImages['./struktur-nilai2.png']
            },
            {
              title: 'Pilih Mata Pelajaran',
              description: 'Pilih mata pelajaran yang akan dibuat struktur nilainya',
              image: helperImages['./struktur-nilai3.png']
            },
            {
              title: 'Atur Komponen Nilai',
              description: 'Tambahkan komponen nilai seperti Formatif, UTS (ASLIM), dan UAS (ASAS) beserta bobotnya',
              image: helperImages['./struktur-nilai4.png']
            },
            {
              title: 'Simpan Struktur',
              description: 'Klik "Simpan" untuk menyimpan struktur nilai',
              image: helperImages['./struktur-nilai5.png']
            }
          ]
        },
        {
          id: 'input-nilai-detail',
          title: 'Input Nilai Detail',
          steps: [
            {
              title: 'Akses Input Nilai',
              description: 'Dari dashboard, klik "Buka Input Nilai" atau menu Input Nilai Detail',
              image: helperImages['./nilai-detail1.png']
            },
            {
              title: 'Filter Data',
              description: 'Pilih kelas, semester, dan mata pelajaran',
              image: helperImages['./nilai-detail3.png']
            },
            {
              title: 'Input Nilai Siswa',
              description: 'Klik "Input" atau "Edit" pada nama siswa untuk mengisi nilai per komponen dan lingkup materi',
              image: helperImages['./nilai-detail4.png']
            },
            {
              title: 'Isi Form Nilai',
              description: 'Masukkan nilai untuk setiap lingkup materi. Sistem akan otomatis menghitung rata-rata',
              image: helperImages['./nilai-detail5.png']
            },
            {
              title: 'Simpan Nilai',
              description: 'Klik "Simpan" setelah selesai mengisi nilai',
              image: helperImages['./nilai-detail6.png']
            },
            {
              title: 'Generate Nilai Akhir',
              description: 'Setelah semua siswa memiliki nilai lengkap, klik "Generate Nilai Akhir" untuk menghitung nilai akhir otomatis',
              image: helperImages['./nilai-detail7.png']
            }
          ]
        },
        {
          id: 'nilai-sikap',
          title: 'Input Nilai Sikap & Ketidakhadiran',
          steps: [
            {
              title: 'Akses Menu',
              description: 'Klik menu "Nilai Sikap & Ketidakhadiran"',
              image: helperImages['./nilai-sikap1.png']
            },
            {
              title: 'Pilih Filter',
              description: 'Pilih kelas dan semester',
              image: helperImages['./nilai-sikap2.png']
            },
            {
              title: 'Isi Nilai Sikap',
              description: 'Pilih nilai sikap (A-E) untuk setiap siswa dan isi deskripsi sikap',
              image: helperImages['./nilai-sikap3.png']
            },
            {
              title: 'Isi Ketidakhadiran',
              description: 'Masukkan jumlah ijin, sakit, dan alpa untuk setiap siswa',
              image: helperImages['./nilai-sikap4.png']
            },
            {
              title: 'Simpan Data',
              description: 'Klik "Simpan Semua" untuk menyimpan data',
              image: helperImages['./nilai-sikap5.png']
            }
          ]
        },
        {
          id: 'jadwal-guru',
          title: 'Membuat Jadwal Pelajaran',
          steps: [
            {
              title: 'Akses Menu Jadwal',
              description: 'Klik menu "Kelola Jadwal"',
              image: helperImages['./jadwal-guru1.png']
            },
            {
              title: 'Pilih Kelas',
              description: 'Pilih kelas yang akan dibuat jadwalnya',
              image: helperImages['./jadwal-guru2.png']
            },
            {
              title: 'Buat Jadwal Baru',
              description: 'Klik "Buat Jadwal Baru" dan isi nama jadwal',
              image: helperImages['./jadwal-guru3.png']
            },
            {
              title: 'Tambah Slot Jadwal',
              description: 'Untuk setiap hari, klik "Tambah Slot" dan pilih jenis slot (Pelajaran atau Istirahat)',
              image: helperImages['./jadwal-guru4.png']
            },
            {
              title: 'Atur Jam & Mata Pelajaran',
              description: 'Tentukan jam mulai, jam selesai, dan pilih mata pelajaran untuk slot pelajaran',
              image: helperImages['./jadwal-guru5.png']
            },
            {
              title: 'Simpan Jadwal',
              description: 'Klik "Simpan Jadwal" setelah selesai mengatur semua slot',
              image: helperImages['./jadwal-guru6.png']
            }
          ]
        },
        {
          id: 'berita-guru',
          title: 'Mengelola Berita',
          steps: [
            {
              title: 'Akses Menu Berita',
              description: 'Klik menu "Kelola Berita"',
              image: helperImages['./berita-guru1.png']
            },
            {
              title: 'Buat Berita Baru',
              description: 'Klik "Buat Berita" dan isi form berita',
              image: helperImages['./berita-guru2.png']
            },
            {
              title: 'Upload Gambar',
              description: 'Upload gambar untuk berita',
              image: helperImages['./berita-guru3.png']
            },
            {
              title: 'Publish atau Draft',
              description: 'Pilih apakah berita akan langsung dipublish atau disimpan sebagai draft',
              image: helperImages['./berita-guru4.png']
            }
          ]
        }
      ]
    },
    admin: {
      title: 'Panduan Admin',
      icon: School,
      color: roleColors.admin,
      sections: [
        {
          id: 'login-admin',
          title: 'Login Admin',
          steps: [
            {
              title: 'Akses Halaman Login',
              description: 'Buka website LMS dan klik "Login Guru" (admin menggunakan login yang sama)',
              image: helperImages['./login-guru1.png']
            },
          ]
        },
        {
          id: 'kelola-siswa',
          title: 'Mengelola Data Siswa',
          steps: [
            {
              title: 'Akses Menu Siswa',
              description: 'Dari dashboard admin, klik "Buka Kelola Siswa"',
              image: helperImages['./siswa-admin1.png']
            },
            {
              title: 'Tambah Siswa',
              description: 'Klik "Tambah Siswa" untuk menambah siswa baru secara manual',
              image: helperImages['./siswa-admin2.png']
            },
            {
              title: 'Isi Data Siswa',
              description: 'Lengkapi form dengan nama, tahun lahir, dan kelas siswa',
              image: helperImages['./siswa-admin3.png']
            },
            {
              title: 'Edit Data Siswa',
              description: 'Klik tombol "Edit" pada daftar siswa untuk mengubah data',
              image: helperImages['./siswa-admin4.png']
            },
            {
              title: 'Reset Password Siswa',
              description: 'Di halaman edit siswa, klik "Reset Password" untuk membuat password baru',
              image: helperImages['./siswa-admin5.png']
            }
          ]
        },
        {
          id: 'kelola-guru',
          title: 'Mengelola Data Guru',
          steps: [
            {
              title: 'Akses Menu Guru',
              description: 'Klik "Buka Kelola Guru" dari dashboard',
              image: helperImages['./guru-admin1.png']
            },
            {
              title: 'Tambah Guru',
              description: 'Klik "Create Guru" untuk menambah guru baru',
              image: helperImages['./guru-admin2.png']
            },
            {
              title: 'Isi Form Guru',
              description: 'Lengkapi data guru: nama, email, password, NIP, dan nomor HP',
              image: helperImages['./guru-admin3.png']
            },
            {
              title: 'Assign Wali Kelas',
              description: 'Klik "Assign Wali" untuk menugaskan guru sebagai wali kelas',
              image: helperImages['./guru-admin4.png']
            },
            {
              title: 'Pilih Guru dan Kelas',
              description: 'Pilih guru dan kelas yang akan ditugaskan',
              image: helperImages['./guru-admin5.png']
            }
          ]
        },
        {
          id: 'kelola-mapel',
          title: 'Mengelola Mata Pelajaran',
          steps: [
            {
              title: 'Akses Menu Mapel',
              description: 'Klik "Buka Kelola Mapel" dari dashboard',
              image: helperImages['./mapel-admin1.png']
            },
            {
              title: 'Tambah Mapel',
              description: 'Klik "Tambah Mapel" dan isi nama serta kode mata pelajaran',
              image: helperImages['./mapel-admin2.png']
            },
            {
              title: 'Assign Mapel ke Kelas',
              description: 'Klik "Assign Mapel" untuk menghubungkan mata pelajaran dengan kelas',
              image: helperImages['./mapel-admin3.png']
            },
            {
              title: 'Pilih Kelas dan Mapel',
              description: 'Pilih kelas dan centang mata pelajaran yang akan ditambahkan',
              image: helperImages['./mapel-admin4.png']
            }
          ]
        },
        {
          id: 'tahun-ajaran',
          title: 'Mengelola Tahun Ajaran',
          steps: [
            {
              title: 'Akses Menu',
              description: 'Klik tombol "Ganti Tahun Ajaran" atau akses menu Tahun Ajaran',
              image: helperImages['./year-admin1.png']
            },
            {
              title: 'Ganti Tahun Ajaran Baru',
              description: 'Klik "Change Year" dan isi nama tahun baru (contoh: 2024/2025)',
              image: helperImages['./year-admin6.png']
            },
            {
              title: 'Isi Form Tahun Ajaran',
              description: 'isi tahun ajaran, dan pilih siswa yang tidak naik kelas jika ada',
              image: helperImages['./year-admin2.png']
            },
             {
              title: 'Preview Tahun Ajaran',
              description: 'preview data tahun ajaran baru sebelum disimpan untuk memastikan data sudah benar',
              image: helperImages['./year-admin3.png']
            },
            {
              title: 'Set Tahun Ajaran Aktif',
              description: 'Centang "Set aktif" untuk menjadikan tahun ajaran tersebut aktif',
              image: helperImages['./year-admin4.png']
            },
            {
              title: 'Toggle Semester',
              description: 'Klik tombol toggle pada semester untuk mengaktifkan/menonaktifkan semester',
              image: helperImages['./year-admin5.png']
            },
          ]
        }
      ]
    }
  };

  // Search functionality
  const searchTutorials = () => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    Object.entries(tutorials).forEach(([role, data]) => {
      data.sections.forEach(section => {
        if (
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.steps.some(step => 
            step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            step.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) {
          results.push({
            role,
            roleTitle: data.title,
            section: section.id,
            sectionTitle: section.title
          });
        }
      });
    });
    return results;
  };

  const searchResults = searchQuery ? searchTutorials() : [];

  // Render home page
  const renderHome = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <BookOpen className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">Pusat Bantuan LMS</h1>
            <p className="text-blue-100 mt-2">SD Negeri Proyonanggan 9 Batang</p>
          </div>
        </div>
        <p className="text-lg text-blue-50">
          Panduan lengkap penggunaan sistem Learning Management System untuk Murid, Guru, dan Admin
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tutorial... (contoh: 'login', 'nilai', 'jadwal')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Hasil Pencarian:</p>
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveRole(result.role);
                  setActiveSection(result.section);
                  setSearchQuery('');
                }}
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">{result.sectionTitle}</div>
                <div className="text-sm text-blue-600">di {result.roleTitle}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tutorials).map(([role, data]) => {
          const Icon = data.icon;
          const color = data.color;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className={`w-14 h-14 ${color.light} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${color.text}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{data.title}</h3>
              <p className="text-gray-600 mb-4">
                {data.sections.length} tutorial tersedia
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Lihat Panduan
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tips Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Simpan Password Anda</h4>
              <p className="text-sm text-gray-600">Password sangat penting untuk akses sistem</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Cek Nilai Berkala</h4>
              <p className="text-sm text-gray-600">Pantau perkembangan nilai Anda secara rutin</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Hubungi Guru/Admin</h4>
              <p className="text-sm text-gray-600">Jika ada masalah, segera hubungi guru atau admin</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-bold">4</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Logout Setelah Selesai</h4>
              <p className="text-sm text-gray-600">Jangan lupa logout untuk keamanan akun</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tutorial list for a role
  const renderTutorialList = (role) => {
    const data = tutorials[role];
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-r ${data.color.from} ${data.color.to} rounded-xl p-6 text-white`}>
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <p className="text-white/90">Pilih tutorial yang ingin Anda pelajari</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 mb-4">
                {section.steps.length} langkah
              </p>
              <div className={`flex items-center ${data.color.text} font-medium`}>
                Mulai Tutorial
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render tutorial detail
  const renderTutorialDetail = (role, sectionId) => {
    const data = tutorials[role];
    const section = data.sections.find(s => s.id === sectionId);
    if (!section) return null;

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-r ${data.color.from} ${data.color.to} rounded-xl p-6 text-white`}>
          <h1 className="text-3xl font-bold mb-2">{section.title}</h1>
          <p className="text-white/90">{data.title}</p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {section.steps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 ${data.color.light} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`${data.color.text} font-bold`}>{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="bg-gray-50 p-4">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full rounded-lg shadow-md"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setActiveSection(null)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Kembali ke Daftar Tutorial
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                setActiveRole('home');
                setActiveSection(null);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Pusat Bantuan LMS</h1>
                <p className="text-xs text-gray-500">SD Negeri Proyonanggan 9</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveRole('home');
                  setActiveSection(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeRole === 'home'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Beranda
              </button>
              {Object.entries(tutorials).map(([role, data]) => {
                const Icon = data.icon;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      setActiveSection(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeRole === role
                        ? `${data.color.light} ${data.color.text} font-medium`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {data.title}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setActiveRole('home');
                  setActiveSection(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeRole === 'home'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                Beranda
              </button>
              {Object.entries(tutorials).map(([role, data]) => {
                const Icon = data.icon;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      setActiveSection(null);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeRole === role
                        ? `${data.color.light} ${data.color.text} font-medium`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {data.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {activeRole !== 'home' && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => {
                setActiveRole('home');
                setActiveSection(null);
              }}
              className="hover:text-blue-600"
            >
              Beranda
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => setActiveSection(null)}
              className={activeSection ? 'hover:text-blue-600' : 'text-gray-900 font-medium'}
            >
              {tutorials[activeRole]?.title}
            </button>
            {activeSection && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">
                  {tutorials[activeRole]?.sections.find(s => s.id === activeSection)?.title}
                </span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        {activeRole === 'home' && renderHome()}
        {activeRole !== 'home' && !activeSection && renderTutorialList(activeRole)}
        {activeRole !== 'home' && activeSection && renderTutorialDetail(activeRole, activeSection)}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="font-medium">SD Negeri Proyonanggan 9 Batang</p>
            <p className="mt-1">© 2025 Learning Management System - Pusat Bantuan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpDocumentation;