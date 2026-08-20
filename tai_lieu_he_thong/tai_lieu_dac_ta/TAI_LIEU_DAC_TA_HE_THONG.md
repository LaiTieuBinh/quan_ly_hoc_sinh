# Tai lieu dac ta he thong quan ly hoc sinh tieng Nhat

## 1. Thong tin tai lieu

| Thuoc tinh | Gia tri |
| --- | --- |
| Phien ban | 1.0 |
| Pham vi | Phien ban dau tien (MVP) |
| Doi tuong su dung | Quan tri vien, nhan vien, giao vien, hoc sinh |
| Muc dich | Lam co so cho thiet ke, phat trien, kiem thu va nghiem thu he thong |

## 2. Muc tieu he thong

He thong quan ly hoat dong dao tao tieng Nhat cho trung tam/truong hoc: ho so hoc sinh, cap do JLPT, lop hoc, giao vien, lich hoc, diem danh, ket qua hoc tap, hoc phi, bai tap, tai lieu va bao cao.

## 3. Pham vi va quy uoc

### 3.1. Cap do JLPT

He thong chi dung nam cap do: `N5`, `N4`, `N3`, `N2`, `N1`. N5 la cap do thap nhat va N1 la cap do cao nhat.

### 3.2. Trang thai chinh

| Doi tuong | Trang thai |
| --- | --- |
| Hoc sinh | Dang hoc, Bao luu, Nghi hoc |
| Dang ky lop | Dang hoc, Da chuyen lop, Da ket thuc, Huy |
| Diem danh | Co mat, Di muon, Vang co phep, Vang khong phep, Ve som |
| Bai tap | Nhap, Da giao, Dong nop |
| Bai nop | Chua nop, Dung han, Tre han, Da cham, Da tra |
| Hoc phi | Chua thanh toan, Thanh toan mot phan, Da thanh toan, Qua han |
| Tai lieu | Hien thi, An, Da xoa |

## 4. Vai tro va quyen han

| Ma | Vai tro | Quyen han |
| --- | --- | --- |
| ROLE-01 | Quan tri vien | Quan ly toan bo tai khoan, du lieu danh muc, cau hinh, bao cao va phan quyen. |
| ROLE-02 | Nhan vien | Quan ly hoc sinh, dang ky lop, lop hoc va hoc phi; xem bao cao duoc cap quyen. |
| ROLE-03 | Giao vien | Chi thao tac tren lop/mon duoc phan cong: lich hoc, diem danh, diem, bai tap va tai lieu. |
| ROLE-04 | Hoc sinh | Chi xem du lieu ca nhan va du lieu da cong bo cua cac lop dang tham gia. |

## 5. Yeu cau chuc nang

### 5.1. Xac thuc va phan quyen

| Ma | Yeu cau |
| --- | --- |
| FR-AUTH-01 | He thong phai cho phep nguoi dung dang nhap bang tai khoan va mat khau. |
| FR-AUTH-02 | He thong phai ap dung quyen theo vai tro va khong cho phep truy cap chuc nang/du lieu khong duoc cap quyen. |
| FR-AUTH-03 | Quan tri vien phai co the tao, khoa/mo khoa va gan vai tro cho tai khoan. |

### 5.2. Hoc sinh va lo trinh JLPT

| Ma | Yeu cau |
| --- | --- |
| FR-STU-01 | Nhan vien/quan tri vien phai co the tao, xem, sua ho so hoc sinh gom ma hoc sinh, ho ten, ngay sinh, gioi tinh, anh va lien he. |
| FR-STU-02 | Ma hoc sinh phai duy nhat trong he thong. |
| FR-STU-03 | He thong phai luu trang thai hoc cua hoc sinh. |
| FR-LVL-01 | Moi hoc sinh dang hoc phai co mot cap do JLPT hien tai trong nam cap do N5-N1. |
| FR-LVL-02 | He thong phai luu lich su cap do: cap do cu, cap do moi, ngay ap dung, ly do va nguoi thuc hien. |
| FR-LVL-03 | He thong phai cho phep cau hinh tieu chi len cap theo diem, ty le chuyen can va danh gia giao vien. |
| FR-LVL-04 | He thong phai lap danh sach hoc sinh dat, sap dat va chua dat dieu kien len cap. |

### 5.3. Nien khoa, lop hoc, mon hoc va giao vien

| Ma | Yeu cau |
| --- | --- |
| FR-CLS-01 | Quan tri vien/nhan vien phai co the quan ly nien khoa, ky hoc, phong hoc, ca hoc va lop hoc. |
| FR-CLS-02 | Moi lop hoc phai thuoc mot nien khoa, mot ky hoc va mot cap do JLPT. |
| FR-CLS-03 | He thong phai cho phep them, chuyen va ket thuc dang ky lop cua hoc sinh, dong thoi luu lich su. |
| FR-SUB-01 | He thong phai quan ly danh muc mon hoc: tu vung, ngu phap, nghe, noi, doc, viet va Kanji. |
| FR-TCH-01 | He thong phai luu ho so giao vien va cac cap do giao vien co the giang day. |
| FR-TCH-02 | He thong phai cho phep phan cong giao vien theo lop, mon hoc va thoi gian. |

### 5.4. Thoi khoa bieu va diem danh

| Ma | Yeu cau |
| --- | --- |
| FR-SCH-01 | Giao vien/nhan vien phai co the tao buoi hoc gan voi lop, mon, giao vien, phong, ngay va gio bat dau/ket thuc. |
| FR-SCH-02 | He thong phai canh bao va khong cho luu khi giao vien, lop hoc hoac phong hoc bi trung khoang thoi gian. |
| FR-SCH-03 | Hoc sinh va giao vien phai xem duoc thoi khoa bieu lien quan den minh. |
| FR-ATT-01 | Giao vien phai co the diem danh hoc sinh da dang ky lop cho tung buoi hoc. |
| FR-ATT-02 | He thong phai luu trang thai diem danh va ghi chu cho tung hoc sinh trong tung buoi hoc. |
| FR-ATT-03 | He thong phai tinh va thong ke ty le chuyen can theo hoc sinh, lop, cap do, ky hoc va khoang thoi gian. |

### 5.5. Diem, danh gia va ky thi JLPT

| Ma | Yeu cau |
| --- | --- |
| FR-GRD-01 | Giao vien phai co the tao dot danh gia va nhap diem theo lop, mon hoc va loai danh gia. |
| FR-GRD-02 | He thong phai ho tro cac ky nang: tu vung/ngu phap, doc hieu, nghe hieu; co the them noi va viet. |
| FR-GRD-03 | He thong phai tinh diem trung binh, xep loai va luu nhan xet giao vien theo cau hinh cua lop/dot danh gia. |
| FR-EXM-01 | He thong phai quan ly bai kiem tra noi bo va ky thi thu JLPT theo cap do. |
| FR-EXM-02 | He thong phai luu ket qua thi JLPT chinh thuc, ngay thi, cap do, ket qua va tep chung chi (neu co). |
| FR-EXM-03 | He thong phai hien thi so sanh ket qua cac lan thi cua mot hoc sinh. |

### 5.6. Hoc phi

| Ma | Yeu cau |
| --- | --- |
| FR-FEE-01 | Nhan vien/quan tri vien phai co the thiet lap khoan thu theo lop, cap do hoac ky hoc. |
| FR-FEE-02 | He thong phai tao nghia vu hoc phi cho hoc sinh dang ky lop va cho phep ap dung mien/giam. |
| FR-FEE-03 | He thong phai ghi nhan giao dich thanh toan, ngay thu, so tien, phuong thuc va nguoi thu. |
| FR-FEE-04 | He thong phai tinh so tien da thu, con no va trang thai thanh toan; co the in phieu thu. |

### 5.7. Bai tap ve nha

| Ma | Yeu cau |
| --- | --- |
| FR-HWK-01 | Giao vien phai co the tao bai tap cho lop/mon hoc, gan cap do, mo ta, tep dinh kem va han nop. |
| FR-HWK-02 | Hoc sinh trong lop duoc giao phai co the nop bai bang noi dung van ban va/hoac tep dinh kem. |
| FR-HWK-03 | He thong phai tu dong xac dinh bai nop dung han hoac tre han theo thoi diem nop va han nop. |
| FR-HWK-04 | Giao vien phai co the cham diem, nhan xet va tra bai; hoc sinh xem duoc ket qua cua minh. |
| FR-HWK-05 | He thong phai thong ke ty le hoan thanh bai tap theo hoc sinh va lop. |

### 5.8. Tai lieu hoc tap

| Ma | Yeu cau |
| --- | --- |
| FR-MAT-01 | Giao vien phai co the tai len tai lieu, gan lop, mon, cap do, chu de, bai hoc va ky nang. |
| FR-MAT-02 | He thong phai ho tro tep tai lieu va lien ket den tai nguyen ben ngoai. |
| FR-MAT-03 | Hoc sinh chi duoc xem/tai tai lieu thuoc lop dang hoc hoac duoc cap quyen theo cap do. |
| FR-MAT-04 | Giao vien phai co the cap nhat, an va xoa tai lieu do minh quan ly; quan tri vien co quyen quan ly toan bo. |
| FR-MAT-05 | He thong phai ho tro tim kiem tai lieu theo ten, chu de, ky nang va cap do; luu luot xem/tai neu duoc bat. |

### 5.9. Bao cao

| Ma | Yeu cau |
| --- | --- |
| FR-RPT-01 | He thong phai bao cao si so hoc sinh theo cap do, lop, nien khoa va ky hoc. |
| FR-RPT-02 | He thong phai bao cao chuyen can, ket qua hoc tap va ty le hoan thanh bai tap. |
| FR-RPT-03 | He thong phai cung cap danh sach hoc sinh co nguy co: chuyen can thap, diem thap, chua nop bai hoac chua du dieu kien len cap. |
| FR-RPT-04 | He thong phai bao cao hoc phi, cong no va doanh thu theo lop, cap do va ky hoc. |

## 6. Quy tac nghiep vu

| Ma | Quy tac |
| --- | --- |
| BR-01 | Mot hoc sinh chi co mot cap do JLPT hien tai tai mot thoi diem. |
| BR-02 | Hoc sinh chi duoc dang ky vao lop co cap do phu hop voi cap do hien tai, tru khi nguoi co quyen phe duyet ngoai le. |
| BR-03 | Khong duoc co hai dang ky lop dang hoc trung nhau cua mot hoc sinh trong cung mot lop. |
| BR-04 | Diem danh chi duoc tao cho hoc sinh co dang ky lop hop le tai ngay dien ra buoi hoc. |
| BR-05 | Mot hoc sinh co toi da mot ban ghi diem danh cho mot buoi hoc. |
| BR-06 | Ty le chuyen can = so buoi co mat hop le / tong so buoi duoc tinh chuyen can x 100%. Quy uoc tinh di muon va ve som phai cau hinh duoc. |
| BR-07 | Bai nop co thoi diem nop sau han nop duoc danh dau tre han; bai nop sau khi bai tap dong nop khong duoc chap nhan tru khi giao vien mo lai. |
| BR-08 | Hoc sinh khong duoc truy cap diem, bai nop, hoc phi hoac tai lieu bi han che cua hoc sinh khac. |
| BR-09 | So tien da thanh toan cua mot nghia vu hoc phi khong duoc lon hon so tien phai thu, tru khi he thong ho tro xu ly thanh toan thua. |
| BR-10 | Thay doi cap do, diem, diem danh va giao dich hoc phi phai luu nguoi thuc hien va thoi gian thay doi. |

## 7. Du lieu cot loi

| Thuc the | Thuoc tinh quan trong |
| --- | --- |
| TaiKhoan | id, ten_dang_nhap, mat_khau_ma_hoa, vai_tro, trang_thai |
| HocSinh | id, ma_hoc_sinh, ho_ten, ngay_sinh, gioi_tinh, lien_he, trang_thai, cap_do_hien_tai |
| LichSuCapDo | hoc_sinh_id, cap_do_cu, cap_do_moi, ngay_ap_dung, ly_do |
| NienKhoa/KyHoc | id, ten, ngay_bat_dau, ngay_ket_thuc, trang_thai |
| LopHoc | id, ma_lop, ten_lop, cap_do, nien_khoa_id, ky_hoc_id, phong_hoc |
| DangKyLop | hoc_sinh_id, lop_hoc_id, ngay_dang_ky, trang_thai |
| GiaoVien | id, ma_giao_vien, ho_ten, lien_he, chuyen_mon |
| PhanCong | giao_vien_id, lop_hoc_id, mon_hoc_id, vai_tro |
| BuoiHoc | lop_hoc_id, mon_hoc_id, giao_vien_id, phong, bat_dau, ket_thuc |
| DiemDanh | buoi_hoc_id, hoc_sinh_id, trang_thai, ghi_chu |
| DotDanhGia/Diem | lop_hoc_id, loai, ky_nang, hoc_sinh_id, diem, nhan_xet |
| KyThiJLPT | hoc_sinh_id, cap_do, ngay_thi, ket_qua, chung_chi_url |
| NghiaVuHocPhi/GiaoDich | hoc_sinh_id, lop_hoc_id, so_tien, mien_giam, trang_thai, ngay_thu |
| BaiTap/BaiNop | lop_hoc_id, mon_hoc_id, han_nop, hoc_sinh_id, thoi_diem_nop, diem, nhan_xet |
| TaiLieu | nguoi_tao_id, lop_hoc_id, mon_hoc_id, cap_do, tieu_de, loai, duong_dan, trang_thai |

## 8. Yeu cau phi chuc nang

| Ma | Yeu cau |
| --- | --- |
| NFR-01 | Giao dien phai ho tro tieng Viet va co the mo rong tieng Nhat trong tuong lai. |
| NFR-02 | Mat khau phai duoc ma hoa; he thong chi cho phep truy cap du lieu theo quyen. |
| NFR-03 | Tep tai len phai kiem tra dinh dang, dung luong va quyen truy cap truoc khi tai ve. |
| NFR-04 | Cac thao tac quan trong phai co nhat ky: dang nhap, thay doi diem, diem danh, cap do va hoc phi. |
| NFR-05 | Du lieu phai co co che sao luu dinh ky va kha nang khoi phuc khi su co. |
| NFR-06 | Cac danh sach lon phai co tim kiem, loc, sap xep va phan trang. |
| NFR-07 | He thong phai hien thi tot tren may tinh va dien thoai cho cac tac vu cua hoc sinh/giao vien. |

## 9. Tieu chi nghiem thu MVP

1. Quan tri vien tao duoc tai khoan, vai tro, hoc sinh, giao vien, cap do, lop, mon va buoi hoc.
2. Nhan vien dang ky hoc sinh vao lop va lap nghia vu hoc phi.
3. Giao vien phan cong co the diem danh, nhap diem, giao/cham bai tap va chia se tai lieu cho lop.
4. Hoc sinh dang nhap xem duoc thoi khoa bieu, diem danh, diem, bai tap, bai nop va tai lieu cua minh.
5. He thong xuat duoc cac bao cao co ban ve si so, chuyen can, ket qua hoc tap, bai tap va hoc phi.
6. He thong khong cho phep truy cap du lieu vuot qua quyen cua nguoi dung.

## 10. Ngoai pham vi MVP

- Lien lac voi phu huynh.
- Quan ly y te hoc duong.
- Hoat dong ngoai khoa.
- Thu vien va quan ly tai san.
- Tich hop thanh toan truc tuyen, neu chua duoc yeu cau o giai doan sau.
