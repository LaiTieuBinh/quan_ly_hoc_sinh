import { HttpException } from '@nestjs/common';
import { parseAccount, parseList, parseProfiles, parseReset, parseStatus, positiveId } from './account.input';

describe('Account request validation', () => {
  const create = { ten_dang_nhap: '  gv.nguyen  ', mat_khau: 'a-long-password', vai_tro: 'GIAO_VIEN', giao_vien_id: 8 };
  it('trims usernames, preserves passwords, and defaults status', () => {
    expect(parseAccount({ ...create, mat_khau: ' a-long-password ' }, true)).toMatchObject({ ten_dang_nhap: 'gv.nguyen', mat_khau: ' a-long-password ', trang_thai: 'HOAT_DONG' });
  });
  it.each([null, [], {}, { ...create, vai_tro: 'ROOT' }, { ...create, giao_vien_id: '8' }, { ...create, trang_thai: null }, { ...create, mat_khau: 'short' }])('rejects invalid create payload %j', input => {
    expect(() => parseAccount(input, true)).toThrow(HttpException);
  });
  it('rejects passwords and untrusted actor fields in an update', () => {
    expect(() => parseAccount({ mat_khau: 'a-long-password' }, false)).toThrow(HttpException);
    expect(() => parseAccount({ actor: 1, vai_tro: 'NHAN_VIEN' }, false)).toThrow(HttpException);
    expect(parseAccount({ giao_vien_id: null, hoc_sinh_id: null }, false)).toEqual({ giao_vien_id: null, hoc_sinh_id: null });
  });
  it('accepts FE empty filters and returns pagination defaults', () => {
    expect(parseList({ q: ' admin ', vai_tro: '', trang_thai: '' })).toEqual({ q: 'admin', page: 1, page_size: 20, sort: '-updated_at' });
  });
  it.each([{ page: '1.5' }, { page: '-1' }, { page_size: '101' }, { sort: 'mat_khau' }, { q: ['a', 'b'] }, { page: '9007199254740991' }])('rejects malformed query %j', query => {
    expect(() => parseList(query)).toThrow(HttpException);
  });
  it.each(['0', '1.5', '-1', 'Infinity', '9007199254740992', 'abc'])('rejects unsafe ID %s', id => expect(() => positiveId(id)).toThrow(HttpException));
  it('parses booleans without treating false as truthy', () => {
    expect(parseProfiles({ include_inactive: 'false' }).include_inactive).toBe(false);
    expect(parseProfiles({ include_inactive: 'true' }).include_inactive).toBe(true);
    expect(() => parseProfiles({ include_inactive: 'yes' })).toThrow(HttpException);
    expect(parseReset({ mat_khau_moi: 'a-long-password', xac_nhan_mat_khau: 'a-long-password', thu_hoi_phien_hien_tai: false }).revoke).toBe(false);
  });
  it('does not reflect secrets in password errors', () => {
    try { parseReset({ mat_khau_moi: 'secret', xac_nhan_mat_khau: 'other-secret' }); }
    catch (error) { expect(JSON.stringify((error as HttpException).getResponse())).not.toContain('secret'); }
    expect(() => parseReset({ mat_khau_moi: 'a-long-password', xac_nhan_mat_khau: 'not-the-same-value' })).toThrow(HttpException);
    expect(() => parseStatus({ trang_thai: 'BI_KHOA' })).toThrow(HttpException);
  });
});
