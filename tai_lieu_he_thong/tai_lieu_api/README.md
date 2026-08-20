# Danh sach API he thong quan ly hoc sinh

Tai lieu nay tong hop API tu 16 nhom man hinh trong `tai_lieu_man_hinh`. Day la danh sach API de phat trien backend/frontend, khong phai OpenAPI schema.

## 1. Quy uoc chung

- Base URL: `/api/v1`.
- Request/response mac dinh la JSON UTF-8. Upload dung `multipart/form-data`; file va URL tai xuong phai qua endpoint uy quyen.
- Ngay dung `YYYY-MM-DD`; ngay gio dung ISO-8601 co offset.
- Danh sach dung `page`, `page_size`, `sort`; mac dinh `page=1`, `page_size=20`, toi da 100, trừ khi muc API ghi khac.
- Server lay nguoi dung, vai tro, `giao_vien_id` va `hoc_sinh_id` tu session/token. Khong tin cac truong nay tu client de mo rong scope.
- Tat ca bo loc `lop_hoc_id`, `mon_hoc_id`, `ky_hoc_id`, `nien_khoa_id` va `hoc_sinh_id` phai duoc kiem tra lai trong scope tai server.
- Thao tac tao, sua, xoa mem, khoa, huy, thu tien, cham diem, cong bo, dong nop va doi cap do phai ghi audit nguoi thuc hien/thoi diem. Khong ghi mat khau, token day du, storage key, URL ky dai han hay du lieu nhay cam vao log.
- Loi nen dung dang `{ "error": { "code": "...", "message": "...", "fields": {} } }`.
- Ma loi dung chung: `400 INVALID_QUERY`/`INVALID_FILTER`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`/`*_OUT_OF_SCOPE`, `404 *_NOT_FOUND`, `409 *_CONFLICT`, `422 VALIDATION_ERROR`.

## 2. Bang tong hop nhanh

| MH | Man hinh | Nhom API | So endpoint logic |
| --- | --- | --- | ---: |
| MH-01 | Dang nhap | `auth/*` | 5 |
| MH-02 | Tong quan | `dashboard/*` | 4 |
| MH-03 | Tai khoan va phan quyen | `tai-khoan/*`, `ho-so/*` | 9 |
| MH-04 | Hoc sinh | `hoc-sinh/*` | 11 |
| MH-05 | Lo trinh cap do JLPT | `lo-trinh-cap-do/*` | 8 |
| MH-06 | Danh muc hoc vu | `nien-khoa/*`, `ky-hoc/*`, `mon-hoc/*` | 7 |
| MH-07 | Lop hoc va dang ky lop | `lop-hoc/*`, `dang-ky-lop/*` | 8 |
| MH-08 | Giao vien va phan cong | `giao-vien/*`, `phan-cong/*` | 12 |
| MH-09 | Thoi khoa bieu/buoi hoc | `buoi-hoc/*`, `phan-cong-hieu-luc` | 6 |
| MH-10 | Diem danh | `diem-danh/*`, API buoi hoc | 6 |
| MH-11 | Danh gia va diem | `dot-danh-gia/*`, `me/*` | 8 |
| MH-12 | Ky thi JLPT | `ky-thi-jlpt/*`, `me/*` | 8 |
| MH-13 | Hoc phi | `khoan-thu/*`, `nghia-vu/*`, `giao-dich/*`, `bao-cao/*`, `me/*` | 9 |
| MH-14 | Bai tap va bai nop | `bai-tap/*`, `bai-nop/*`, file | 10 |
| MH-15 | Tai lieu hoc tap | `tai-lieu/*`, `me/*` | 8 |
| MH-16 | Bao cao | `bao-cao/*` | 8 |

> Tong tren la so endpoint logic theo tai lieu man hinh. Cac dong co nhieu method duoc tach method trong muc chi tiet; cac API dung chung duoc nhac lai o man hinh su dung.

## 3. API theo man hinh

### MH-01 - Dang nhap

Quyen: login khong can session; cac API con lai can session/refresh token theo kien truc. Dung HTTPS, cookie `HttpOnly`, `Secure`, `SameSite`; CSRF neu dung cookie.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | Xac thuc va tao session | `ten_dang_nhap`, `mat_khau`, `remember_me` | 200, cookie/session va thong tin user toi thieu |
| GET | `/auth/me` | Lay user, vai tro, quyen va session hien tai | Cookie session/Bearer token | 200 |
| POST | `/auth/refresh` | Lam moi access/session token khi kien truc dung refresh token | Refresh cookie/token | 200; tuy chon |
| POST | `/auth/logout` | Thu hoi session hien tai, xoa cookie | CSRF neu dung cookie; `thu_hoi_tat_ca_phien` tuy chon | 204 |
| GET | `/auth/csrf-token` | Cap token CSRF khi dung co che cookie | Khong co body | 200; tuy chon |

Quy tac: loi dang nhap tra thong diep chung; rate limit login; khong phan biet tai khoan khong ton tai, sai mat khau hay bi khoa; mat khau dung Argon2id/bcrypt va khong bao gio xuat ra response.

### MH-02 - Tong quan

Quyen: session hop le; widget duoc loc theo vai tro va scope. Bo loc chinh: `nien_khoa_id`, `ky_hoc_id`, `lop_hoc_id`, `tu_ngay`, `den_ngay`, `widgets`, `include_lists`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/dashboard/filter-options` | Tra danh muc bo loc hop le theo scope | `nien_khoa_id`, `ky_hoc_id`, `include` | 200; nien khoa/ky hoc/lop hoc |
| GET | `/dashboard/overview` | Tra the chi so, danh sach va dieu huong theo vai tro | Bo loc dashboard; khong nhan `vai_tro`, `hoc_sinh_id`, `giao_vien_id` | 200; widget co `SUCCESS/EMPTY/ERROR/FORBIDDEN` |
| GET | `/dashboard/widgets/{widget_code}` | Tai lai mot widget | Cac bo loc dashboard | 200 |
| POST | `/dashboard/detail-context` | Tao context dieu huong ngan han cho bo loc phuc tap | `widget_code`, `bo_loc` | 200; tuy chon, tra context token TTL ngan |

Quy tac: giao vien chi xem lop duoc phan cong; hoc sinh bi co dinh theo tai khoan; bo loc sai quan he tra 400, ngoai scope tra 403; khong cache chung giua cac scope.

### MH-03 - Tai khoan va phan quyen

Quyen: tat ca API trong nhom nay yeu cau vai tro `QUAN_TRI_VIEN`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/tai-khoan` | Danh sach tai khoan | `q`, `vai_tro`, `trang_thai`, `page`, `page_size`, `sort` | 200; khong co password/hash/token |
| POST | `/tai-khoan` | Tao tai khoan va lien ket ho so | `ten_dang_nhap`, `mat_khau`, `vai_tro`, `trang_thai`, `giao_vien_id` hoac `hoc_sinh_id` | 201 |
| GET | `/tai-khoan/{id}` | Chi tiet tai khoan | Path `id` | 200 |
| PATCH | `/tai-khoan/{id}` | Cap nhat ten, vai tro, trang thai, ho so lien ket | Chi cac truong thay doi; khong nhan mat khau | 200 |
| PATCH | `/tai-khoan/{id}/trang-thai` | Khoa/mo khoa va thu hoi session khi khoa | `trang_thai`, `ly_do` | 200 |
| POST | `/tai-khoan/{id}/dat-lai-mat-khau` | Dat lai mat khau | `mat_khau_moi`, `xac_nhan_mat_khau`, `thu_hoi_phien_hien_tai` | 200 |
| GET | `/ho-so/giao-vien-kha-dung` | Tra ho so giao vien chua lien ket | `q`, `tai_khoan_id`, `include_inactive`, phan trang | 200 |
| GET | `/ho-so/hoc-sinh-kha-dung` | Tra ho so hoc sinh chua lien ket | `q`, `tai_khoan_id`, `include_inactive`, phan trang | 200 |

Quy tac: username duy nhat; vai tro giao vien chi co `giao_vien_id`, hoc sinh chi co `hoc_sinh_id`; khong khoa quan tri vien hoat dong cuoi cung; khong ghi mat khau vao audit.

### MH-04 - Hoc sinh

Quyen: `STUDENT_READ`, `STUDENT_WRITE` va quyen tung tab; giao vien bi gioi han boi `PhanCong`, hoc sinh chi xem ho so lien ket cua minh.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/hoc-sinh` | Danh sach hoc sinh | `q`, `trang_thai`, `cap_do`, `lop_hoc_id`, `nien_khoa_id`, `ky_hoc_id`, phan trang/sort | 200 |
| POST | `/hoc-sinh` | Tao ho so | Ma, ho ten, ngay sinh, lien he, trang thai, cap do | 201 |
| GET | `/hoc-sinh/{id}` | Chi tiet thong tin chung va tab duoc phep | Path `id` | 200 |
| PATCH | `/hoc-sinh/{id}` | Cap nhat ho so | Truong thay doi; doi trang thai/cap do phai audit | 200 |
| POST | `/hoc-sinh/{id}/anh` | Upload anh dai dien | multipart field `anh` | 201; metadata an toan |
| GET | `/hoc-sinh/{id}/anh` | Xem/stream anh dai dien | Path `id` | 200/URL ky ngan |
| GET | `/hoc-sinh/{id}/lich-su-cap-do` | Tab lich su cap do | `tu_ngay`, `den_ngay`, phan trang | 200 |
| GET | `/hoc-sinh/{id}/dang-ky-lop` | Tab lich su dang ky lop | Loc nien khoa/ky/lop/trang thai/ngay, phan trang | 200 |
| GET | `/hoc-sinh/{id}/chuyen-can` | Tab tong hop/chi tiet chuyen can | Lop, ky, nien khoa, ngay, `include_details`, phan trang | 200 |
| GET | `/hoc-sinh/{id}/diem` | Tab diem | Lop, mon, ky nang, dot danh gia, ngay, phan trang | 200 |
| GET | `/hoc-sinh/{id}/hoc-phi` | Tab hoc phi | Ky, trang thai, han thu, `include_transactions`, phan trang | 200 |
| GET | `/hoc-sinh/{id}/bai-tap` | Tab bai tap va bai nop | Lop, mon, trang thai bai/nop, ngay, phan trang | 200 |

Quy tac: khong co xoa cung hoc sinh; ngay sinh khong o tuong lai; hoc sinh dang hoc phai co cap do; anh kiem tra MIME/kich thuoc/quetch an toan; moi tab kiem tra quyen doc rieng.

### MH-05 - Lo trinh cap do JLPT

Quyen doc `LEVEL_PATHWAY_READ`; doi cap do `LEVEL_PATHWAY_WRITE`; tieu chi dung `LEVEL_CRITERIA_READ/WRITE`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/lo-trinh-cap-do/hoc-sinh` | Danh sach hoc sinh va trang thai xet cap | `q`, cap do, trang thai xet, lop/ky/nien khoa, `ngay_danh_gia`, `include_metrics`, phan trang | 200 |
| GET | `/lo-trinh-cap-do/hoc-sinh/{id}` | Tong quan lo trinh va chi so xet | `ngay_danh_gia`, lop/ky/nien khoa | 200 |
| POST | `/lo-trinh-cap-do/hoc-sinh/{id}/cap-do` | Doi cap do va tao lich su | `cap_do_moi`, `ngay_ap_dung`, `ly_do`, `ghi_chu`, `version` | 200 |
| GET | `/lo-trinh-cap-do/hoc-sinh/{id}/lich-su` | Lich su cap do bat bien | `tu_ngay`, `den_ngay`, phan trang/sort | 200 |
| GET | `/lo-trinh-cap-do/hoc-sinh/{id}/ngoai-le-lop` | Tra ngoai le cap do dang ky lop | Lop, trang thai phe duyet, ngay, phan trang | 200 |
| GET | `/lo-trinh-cap-do/tieu-chi` | Danh sach/phien ban tieu chi | Cap do tu/den, trang thai, ngay hieu luc, phan trang | 200 |
| POST | `/lo-trinh-cap-do/tieu-chi` | Tao tieu chi | Cap do tu/den, diem, chuyen can, danh gia, khoang hieu luc | 201 |
| PATCH | `/lo-trinh-cap-do/tieu-chi/{id}` | Cap nhat/phien ban tieu chi | Truong thay doi, khong pha lich su da dung | 200 |

Quy tac: cap do moi khac cap do hien tai; doi cap do tao lich su, cap nhat hoc sinh va audit trong mot transaction; tieu chi cung cap do khong duoc chong lap hieu luc; thieu du lieu phai tra `CHUA_DU_DU_LIEU`, khong suy dien `CHUA_DAT`.

### MH-06 - Danh muc hoc vu

Quyen doc/ghi/xoa: `ACADEMIC_CATALOG_READ`, `ACADEMIC_CATALOG_WRITE`, `ACADEMIC_CATALOG_DELETE`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/nien-khoa` | Danh sach nien khoa | `q`, `trang_thai`, phan trang/sort, `include=semester_count` | 200 |
| POST | `/nien-khoa` | Tao nien khoa | `ten`, `ngay_bat_dau`, `ngay_ket_thuc`, `trang_thai` | 201 |
| GET | `/nien-khoa/{id}` | Chi tiet nien khoa | Path `id` | 200 |
| PATCH | `/nien-khoa/{id}` | Cap nhat nien khoa | Truong thay doi, kiem tra ky/lop phu thuoc | 200 |
| DELETE | `/nien-khoa/{id}` | Xoa khi khong co tham chieu | Path `id` | 204; 409 neu dang dung |
| GET | `/ky-hoc` | Danh sach ky hoc | `nien_khoa_id`, `q`, `trang_thai`, phan trang/sort | 200 |
| POST | `/ky-hoc` | Tao ky hoc | Nien khoa, ten, khoang ngay, trang thai | 201 |
| GET | `/ky-hoc/{id}` | Chi tiet ky hoc | Path `id` | 200 |
| PATCH | `/ky-hoc/{id}` | Cap nhat ky hoc | Truong thay doi; khoang nam trong nien khoa | 200 |
| DELETE | `/ky-hoc/{id}` | Xoa khi khong co tham chieu | Path `id` | 204; 409 neu dang dung |
| GET | `/mon-hoc` | Danh sach mon hoc | `q`, `trang_thai`, `include=usage_summary`, phan trang/sort | 200 |
| POST | `/mon-hoc` | Tao mon hoc | `ma`, `ten`, `mo_ta`, `trang_thai` | 201 |
| GET | `/mon-hoc/{id}` | Chi tiet mon hoc | Path `id` | 200 |
| PATCH | `/mon-hoc/{id}` | Cap nhat mon hoc | Ma/ten/mo ta/trang thai | 200 |
| DELETE | `/mon-hoc/{id}` | Xoa khi khong co tham chieu | Path `id` | 204; 409 neu dang dung |
| POST | `/mon-hoc/khoi-tao-mac-dinh` | Tao idempotent 7 mon mac dinh | Khong body; `overwrite=false` tuy chon | 200 |

Quy tac: ngay ket thuc khong truoc ngay bat dau; ky hoc phai nam trong nien khoa; ma mon duy nhat; danh muc da duoc tham chieu thi chuyen `KHONG_AP_DUNG` thay vi xoa cung.

### MH-07 - Lop hoc va dang ky lop

Quyen lop `CLASS_READ/WRITE`; dang ky `ENROLLMENT_READ/WRITE`; scope giao vien theo phan cong, hoc sinh theo tai khoan.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/lop-hoc` | Danh sach lop | `q`, cap do, nien khoa, ky hoc, trang thai, phong, phan trang/sort | 200 |
| POST | `/lop-hoc` | Tao lop | Ma, ten, cap do, nien khoa, ky hoc, phong, trang thai | 201 |
| GET | `/lop-hoc/{id}` | Chi tiet lop | Path `id` | 200 |
| PATCH | `/lop-hoc/{id}` | Cap nhat lop | Ma/ten/cap do/ky/phong/trang thai | 200 |
| GET | `/lop-hoc/{id}/si-so` | Si so dang hoc hien tai | `tai_ngay`, `include_students`, phan trang neu co danh sach | 200 |
| GET | `/dang-ky-lop` | Danh sach dang ky | Hoc sinh/lop/ky/nien khoa/trang thai/ngay, phan trang/sort | 200 |
| POST | `/dang-ky-lop` | Tao dang ky | Hoc sinh, lop, ngay dang ky, trang thai, ghi chu, ngoai le neu co | 201 |
| GET | `/dang-ky-lop/{id}` | Chi tiet dang ky | Path `id` | 200 |
| PATCH | `/dang-ky-lop/{id}` | Sua truong khong pha lich su | Ghi chu/truong duoc phep | 200 |
| POST | `/dang-ky-lop/{id}/chuyen-lop` | Chuyen lop | Lop moi, ngay chuyen, ly do, ngoai le | 200 |
| POST | `/dang-ky-lop/{id}/ket-thuc` | Ket thuc dang ky | Ngay ket thuc, ly do | 200 |
| POST | `/dang-ky-lop/{id}/huy` | Huy dang ky mem | Ngay huy, ly do | 200 |

Quy tac: ky thuoc nien khoa; dang ky khong chong lan; lop khac cap do phai co ngoai le da duyet; chuyen/ket thuc/huy tao lich su, khong xoa dong cu; si so chi dem dang ky `DANG_HOC` hieu luc.

### MH-08 - Giao vien va phan cong

Quyen: `TEACHER_READ/WRITE`, `ASSIGNMENT_READ/WRITE`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/giao-vien` | Danh sach giao vien | `q`, chuyen mon, cap do, trang thai, phan trang/sort | 200 |
| POST | `/giao-vien` | Tao giao vien | Ma, ho ten, lien he, chuyen mon, cap do giang day, trang thai | 201 |
| GET | `/giao-vien/{id}` | Chi tiet giao vien | Path `id` | 200 |
| PATCH | `/giao-vien/{id}` | Cap nhat giao vien | Lien he/chuyen mon/cap do/trang thai | 200 |
| GET | `/giao-vien/{id}/phan-cong` | Phan cong cua giao vien | Trang thai/ngay/lop/mon, phan trang | 200 |
| GET | `/phan-cong` | Danh sach phan cong | Giao vien/lop/mon/vai tro/trang thai/ngay, phan trang/sort | 200 |
| POST | `/phan-cong` | Tao phan cong | Giao vien, lop, mon, vai tro, tu/den ngay, ghi chu | 201 |
| GET | `/phan-cong/{id}` | Chi tiet phan cong | Path `id`, `ngay_hieu_luc` tuy chon | 200 |
| PATCH | `/phan-cong/{id}` | Cap nhat phan cong | Vai tro/ngay/trang thai/ghi chu; khong doi to hop da phat sinh du lieu | 200 |
| POST | `/phan-cong/{id}/huy` | Huy phan cong | Ngay huy, ly do, ghi chu | 200 |
| GET | `/me/phan-cong-hieu-luc` | Pham vi phan cong cua giao vien dang nhap | `ngay_hieu_luc`, lop, mon, phan trang | 200 |

Quy tac: giao vien phai du nang luc cap do; ngay hieu luc khong chong lan; phan cong het hieu luc/huy khong xoa lich su; giao vien tuong tac chi voi phan cong cua minh.

### MH-09 - Thoi khoa bieu va buoi hoc

Quyen xem `SCHEDULE_READ`; ghi `SESSION_WRITE`; giao vien phai co phan cong hieu luc.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/buoi-hoc` | Danh sach/su kien lich | `tu_thoi_diem`, `den_thoi_diem`, lop/mon/giao vien/phong, trang thai, view, phan trang | 200 |
| POST | `/buoi-hoc` | Tao buoi hoc | `phan_cong_id` hoac lop/mon/giao vien, phong, bat dau/ket thuc, trang thai, ghi chu | 201 |
| GET | `/buoi-hoc/{id}` | Chi tiet buoi hoc | Path `id` | 200 |
| PATCH | `/buoi-hoc/{id}` | Sua buoi hoc | Cac truong thay doi; loai tru chinh khi kiem tra xung dot | 200 |
| POST | `/buoi-hoc/kiem-tra-xung-dot` | Kiem tra lop/giao vien/phong bi trung | Payload lich; `bo_qua_buoi_hoc_id` tuy chon | 200, ke ca khi co xung dot |
| GET | `/phan-cong-hieu-luc` | Danh sach phan cong de tao buoi | `ngay_hieu_luc`, lop, mon, phan trang | 200 |

Quy tac: ket thuc sau bat dau; to hop lop-mon-giao vien phai khop phan cong hieu luc; khong trung thoi gian cung lop/giao vien/phong; kiem tra lai trong transaction khi tao/sua, khong chi tin API preview.

### MH-10 - Diem danh

Quyen `ATTENDANCE_READ`, `ATTENDANCE_WRITE`, `ATTENDANCE_HISTORY_READ`, `ATTENDANCE_REPORT_READ`. API `bao-cao/chuyen-can` dung chung voi MH-16.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/buoi-hoc-co-the-diem-danh` | Chon buoi co the diem danh | Ngay, lop/mon, trang thai, `chi_chua_hoan_tat`, phan trang/sort | 200 |
| GET | `/buoi-hoc/{id}/diem-danh` | Danh sach hoc sinh dang ky hop le va ban ghi hien co | `include_history_summary`, phan trang | 200 |
| PUT | `/buoi-hoc/{id}/diem-danh` | Luu hang loat | `ban_ghi[{hoc_sinh_id,trang_thai,ghi_chu}]`, `atomic`, `version` | 200; 422 va rollback neu atomic loi |
| PUT | `/buoi-hoc/{id}/diem-danh/{hoc_sinh_id}` | Luu mot dong | `trang_thai`, `ghi_chu`, `version` | 200 |
| GET | `/diem-danh/{id}/lich-su` | Lich su thay doi | `page`, `page_size`, `sort` | 200 |
| GET | `/bao-cao/chuyen-can` | Tong hop ty le chuyen can | Hoc sinh/lop/cap do/ky/nien khoa/ngay, trang thai, chi tiet, phan trang | 200 |

Quy tac: chi hoc sinh co dang ky hieu luc tai ngay buoi hoc; unique `(buoi_hoc_id, hoc_sinh_id)`; trang thai gom `CO_MAT`, `DI_MUON`, `VANG_CO_PHEP`, `VANG_KHONG_PHEP`, `VE_SOM`; sua diem danh phai luu gia tri cu/moi, nguoi va thoi gian.

### MH-11 - Danh gia va diem

Quyen `ASSESSMENT_READ/WRITE/PUBLISH`; hoc sinh chi doc ket qua da cong bo cua minh.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/dot-danh-gia` | Danh sach dot danh gia | Bo loc lop/mon/loai/ky nang/ngay/trang thai, phan trang | 200 |
| POST | `/dot-danh-gia` | Tao dot danh gia | Ten, lop, mon, loai, ky nang, ngay, thang diem, cau hinh xep loai, trang thai | 201 |
| GET | `/dot-danh-gia/{id}` | Chi tiet dot | Path `id` | 200 |
| PATCH | `/dot-danh-gia/{id}` | Cap nhat dot | Truong duoc phep theo trang thai | 200 |
| GET | `/dot-danh-gia/{id}/diem` | Danh sach hoc sinh hop le va diem | Phan trang; scope dot | 200 |
| PUT | `/dot-danh-gia/{id}/diem` | Luu diem hang loat | `ban_ghi[{hoc_sinh_id,diem,nhan_xet}]` | 200 |
| PUT | `/dot-danh-gia/{id}/diem/{hoc_sinh_id}` | Luu mot diem | `diem`, `nhan_xet`, `version` tuy chon | 200 |
| POST | `/dot-danh-gia/{id}/cong-bo` | Cong bo ket qua | `ghi_chu` tuy chon | 200 |
| GET | `/dot-danh-gia/{id}/diem/{hoc_sinh_id}/lich-su` | Lich su diem | Path va phan trang | 200 |
| GET | `/me/ket-qua-danh-gia` | Ket qua ca nhan da cong bo | Lop/mon/ky nang/ngay, phan trang | 200 |

Quy tac: hoc sinh phai dang ky hop le tai ngay danh gia; diem nam trong thang; trung binh/xep loai tinh tai server; unique diem theo dot/hoc sinh; cong bo luu nguoi/thoi diem va la cong hien thi cho hoc sinh.

### MH-12 - Ky thi JLPT

Quyen doc/ghi ket qua thi va quyen file theo scope; hoc sinh dung API `me` de xem ket qua cua minh.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/ky-thi-jlpt` | Danh sach ket qua thi | `q`, hoc sinh, loai ky thi, cap do, ket qua, ngay, phan trang/sort | 200 |
| POST | `/ky-thi-jlpt` | Tao ket qua thi | Hoc sinh, loai, cap do, ngay thi, diem/ket qua, ghi chu theo detail design | 201 |
| GET | `/ky-thi-jlpt/{id}` | Chi tiet ket qua | Path `id` | 200 |
| PATCH | `/ky-thi-jlpt/{id}` | Cap nhat ket qua | Truong duoc phep | 200 |
| POST | `/ky-thi-jlpt/{id}/chung-chi` | Upload chung chi | multipart field `file`, `ten_hien_thi` tuy chon | 201 |
| GET | `/ky-thi-jlpt/{id}/chung-chi/{file_id}/tai-xuong` | Tai chung chi da uy quyen | Path ket qua/file | 200/stream hoac URL ky ngan |
| GET | `/hoc-sinh/{id}/lich-su-ky-thi-jlpt` | Lich su thi cua hoc sinh | Cap do, loai, ngay, phan trang | 200 |
| GET | `/me/ky-thi-jlpt` | Ket qua thi cua hoc sinh dang nhap | Cap do, loai, ngay, phan trang | 200 |

Quy tac: server kiem tra scope hoc sinh; file kiem tra MIME/kich thuoc/quetch an toan, khong lo storage path; ghi `created_by`/`updated_by` va audit; hoc sinh khong xem ket qua cua nguoi khac.

### MH-13 - Hoc phi

Quyen doc/ghi tach rieng: `FEE_CATALOG_*`, `FEE_OBLIGATION_*`, `FEE_PAYMENT_*`, `FEE_RECEIPT_READ`, `FEE_DEBT_REPORT_READ`.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/khoan-thu` | Danh sach khoan thu | `q`, lop/cap do/ky, trang thai, phan trang/sort | 200 |
| POST | `/khoan-thu` | Tao khoan thu | Ma, ten, so tien mac dinh, pham vi, trang thai | 201 |
| GET | `/khoan-thu/{id}` | Chi tiet khoan thu | Path `id` | 200 |
| PATCH | `/khoan-thu/{id}` | Cap nhat khoan thu | Ma/ten/tien/pham vi/trang thai | 200 |
| GET | `/nghia-vu-hoc-phi` | Danh sach nghia vu | Hoc sinh/lop/ky/trang thai/han, khoan thu, phan trang, giao dich tuy chon | 200 |
| POST | `/nghia-vu-hoc-phi` | Tao nghia vu | Hoc sinh, khoan thu, phai thu, mien giam, han thu | 201 |
| GET | `/nghia-vu-hoc-phi/{id}` | Chi tiet nghia vu | Path `id`, `include_transactions` tuy chon | 200 |
| PATCH | `/nghia-vu-hoc-phi/{id}` | Sua phan chua chot | Mien giam/ly do/han thu; khong tu gan da thu/con no | 200 |
| GET | `/giao-dich-hoc-phi` | Danh sach giao dich | Nghia vu/hoc sinh/phuong thuc/ngay/nguoi thu, phan trang | 200 |
| POST | `/giao-dich-hoc-phi` | Ghi nhan giao dich va phieu thu | Nghia vu, ngay thu, so tien, phuong thuc, ghi chu; `Idempotency-Key` | 201 |
| GET | `/giao-dich-hoc-phi/{id}/phieu-thu` | Xem/in phieu thu | `format=PDF|HTML` tuy chon | 200/stream hoac URL ky ngan |
| GET | `/bao-cao/cong-no` | Tong hop cong no | Lop/cap do/ky/trang thai/han/ngay chot, chi tiet, phan trang | 200 |
| GET | `/me/hoc-phi` | Hoc phi ca nhan | Ky, trang thai, giao dich, phan trang | 200 |

Quy tac: chi tao nghia vu cho hoc sinh dang ky hop le; `0 <= mien_giam <= phai_thu`; giao dich duong va khong vuot so con thu; khoa nghia vu trong transaction; khong xoa cung giao dich/phieu; so tien decimal chinh xac; hoc sinh bi co dinh theo session.

### MH-14 - Bai tap va bai nop

Quyen `HOMEWORK_READ/WRITE/GRADE`; giao vien phai co phan cong, hoc sinh phai co dang ky lop.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/bai-tap` | Danh sach bai tap | Tim kiem, lop/mon/cap do, trang thai, han, phan trang/sort | 200 |
| POST | `/bai-tap` | Tao bai tap | Lop, mon, tieu de, mo ta, han nop, thang diem, trang thai | 201 |
| GET | `/bai-tap/{id}` | Chi tiet bai tap | Path `id` | 200 |
| PATCH | `/bai-tap/{id}` | Cap nhat bai tap | Truong duoc phep theo trang thai | 200 |
| POST | `/bai-tap/{id}/giao` | Giao bai NHAP -> DA_GIAO | Path `id` | 200 |
| POST | `/bai-tap/{id}/dong-nop` | Dong/mo lai nop bai | `hanh_dong=DONG|MO_LAI`, `ly_do` | 200 |
| GET | `/bai-tap/{id}/bai-nop` | Danh sach bai nop cho giao vien | Trang thai han/cham, q, phan trang/sort | 200 |
| GET | `/bai-tap/{id}/bai-nop/me` | Xem bai nop cua hoc sinh hien tai | Path `id` | 200 |
| PUT | `/bai-tap/{id}/bai-nop/me` | Nop/cap nhat bai nop cua minh | `noi_dung`, `tep_ids`, `version` | 200 |
| PATCH | `/bai-nop/{id}/cham` | Cham va tra bai | `diem`, `nhan_xet`, `tra_bai`, `tep_phan_hoi_ids` | 200 |
| POST | `/bai-tap/{id}/tep` | Upload tep de bai | multipart `file` | 201 |
| POST | `/bai-nop/{id}/tep` | Upload tep bai nop/phan hoi | multipart `file` | 201 |
| GET | `/tep-bai-tap/{file_id}/tai-xuong` | Tai tep bai tap sau uy quyen | Path `file_id` | 200/stream hoac URL ky ngan |

Quy tac: chi `DA_GIAO` moi hien thi cho hoc sinh; server tu tinh dung/trễ han; bai nop unique theo bai tap/hoc sinh va upsert trong transaction; khong nop khi `DONG_NOP`; diem nam trong thang; file kiem tra MIME/kich thuoc/quetch an toan.

### MH-15 - Tai lieu hoc tap

Quyen `MATERIAL_READ/WRITE/DELETE/DOWNLOAD/ANALYTICS_READ`; giao vien chi thao tac trong lop-mon duoc phan cong; hoc sinh chi xem tai lieu hien thi trong scope.

| Method | Path | Muc dich | Dau vao chinh | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/tai-lieu` | Danh sach tai lieu | `q`, chu de, ky nang, cap do, lop/mon, nguon, trang thai, phan trang/sort | 200 |
| POST | `/tai-lieu` | Tao metadata tai lieu | Tieu de, loai nguon, URL/file, pham vi phan phoi, trang thai | 201 |
| GET | `/tai-lieu/{id}` | Chi tiet tai lieu | Path `id` | 200; khong storage key |
| PATCH | `/tai-lieu/{id}` | Cap nhat metadata | Truong thay doi; mot nguon chinh | 200 |
| POST | `/tai-lieu/{id}/tep` | Upload tep nguon | multipart `file`, `ten_hien_thi` tuy chon | 201 |
| POST | `/tai-lieu/{id}/an` | An/hien thi tai lieu | `trang_thai=AN|HIEN_THI` | 200 |
| DELETE | `/tai-lieu/{id}` | Xoa mem | Path `id` | 204; dat `DA_XOA` |
| GET | `/tai-lieu/{id}/truy-cap` | Mo/tai tai lieu sau kiem tra quyen | `action=VIEW|DOWNLOAD` tuy chon | 200/stream, URL ky ngan hoac URL ngoai allowlist |
| GET | `/tai-lieu/{id}/thong-ke` | Thong ke luot xem/tai | `tu_ngay`, `den_ngay`, `group_by` | 200 |
| GET | `/me/tai-lieu` | Tai lieu ca nhan hoc sinh duoc phep xem | Tim kiem/chu de/ky nang/cap do/lop/mon, phan trang | 200 |

Quy tac: FILE va EXTERNAL_LINK khong dong thoi; truoc HIEN_THI phai co nguon va pham vi; URL ngoai chi allowlist giao thuc/domain; file dat kho rieng; hoc sinh khong xem AN/DA_XOA hay tai lieu ngoai lop/cap do.

### MH-16 - Bao cao

Quyen tach rieng theo loai: `REPORT_ENROLLMENT_READ`, `REPORT_ATTENDANCE_READ`, `REPORT_GRADE_READ`, `REPORT_HOMEWORK_READ`, `REPORT_FEE_READ`, `REPORT_RISK_READ`, `REPORT_EXPORT`.

Cac API GET nhan bo loc chung co the ap dung: `nien_khoa_id`, `ky_hoc_id`, `tu_ngay`, `den_ngay`, `cap_do`, `lop_hoc_id`, `mon_hoc_id`, `trang_thai`, `page`, `page_size`; API cu the co them tham so trong bang.

| Method | Path | Muc dich | Dau vao them | Thanh cong |
| --- | --- | --- | --- | --- |
| GET | `/bao-cao/si-so` | Bao cao si so | `include_details`, `group_by=CAP_DO|LOP|KY_HOC`, `trang_thai_dang_ky` | 200 |
| GET | `/bao-cao/chuyen-can` | Bao cao chuyen can | `hoc_sinh_id`, `include_details`, `trang_thai_diem_danh` | 200 |
| GET | `/bao-cao/ket-qua-hoc-tap` | Diem trung binh/xep loai | `dot_danh_gia_id`, `ky_nang`, `xep_loai`, `hoc_sinh_id`, `include_details` | 200 |
| GET | `/bao-cao/bai-tap` | Tien do bai tap | `bai_tap_id`, `trang_thai_nop`, `include_missing` | 200 |
| GET | `/bao-cao/hoc-phi` | Phai thu/da thu/con no/doanh thu | `khoan_thu_id`, han, `tai_ngay`, `include_transactions` | 200 |
| GET | `/bao-cao/hoc-sinh-nguy-co` | Hoc sinh nguy co va ly do | `loai_nguy_co`, `hoc_sinh_id`, `include_details` | 200 |
| POST | `/bao-cao/xuat` | Tao job xuat bao cao nen | `loai_bao_cao`, `dinh_dang`, `bo_loc` | 202; `job_id`, `QUEUED` |
| GET | `/bao-cao/xuat/{job_id}` | Theo doi/tai ket qua xuat | Path `job_id` | 200; `QUEUED/PROCESSING/COMPLETED/FAILED` |

Quy tac: server tinh toan va phan quyen tai tang du lieu; ky hoc phai thuoc nien khoa; khong tra tap rong de che loi scope; bao cao hoc phi can quyen tai chinh; nguy co phai neu gia tri/nguong/nguon va du lieu thieu; job xuat chup scope tai thoi diem tao va chi phat URL ky ngan cho nguoi co quyen.

## 4. API dung chung va phu thuoc

- `/bao-cao/chuyen-can`: duoc MH-10 su dung de thong ke, dong thoi la API bao cao cua MH-16 va du lieu tab chuyen can MH-04.
- `/phan-cong-hieu-luc`: duoc MH-08 quan ly/tra scope va MH-09 dung de tao buoi hoc.
- `/buoi-hoc/{id}/...`: MH-09 la owner cua buoi hoc; MH-10 mo rong tai nguyen diem danh tren cung buoi.
- `/me/hoc-phi`, `/me/ket-qua-danh-gia`, `/me/ky-thi-jlpt`, `/me/tai-lieu`, `/me/phan-cong-hieu-luc`: luon suy ra doi tuong tu session, khong nhan ID nguoi dung de mo rong pham vi.
- File upload/tai xuong cua MH-04, MH-12, MH-14, MH-15 phai co chung chinh sach MIME thuc te, kich thuoc, quet an toan, kho rieng va URL ky ngan.

## 5. Tai lieu nguon

- Danh muc man hinh: `../tai_lieu_man_hinh/README.md`.
- Chi tiet API goc: cac file `DETAIL_DESIGN_*.md` trong 16 thu muc con cua `../tai_lieu_man_hinh`.
- Khi thay doi contract trong tai lieu man hinh, cap nhat catalog nay va schema OpenAPI (neu duoc tao) trong cung pull request.
