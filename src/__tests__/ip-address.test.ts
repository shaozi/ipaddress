import { IpAddress } from '../index';

describe('IpAddress', () => {
  it('should create an instance', () => {
    expect(new IpAddress('10.1.1.1/8')).toBeTruthy();
  });
  it('copy', ()=> {
    let ip = new IpAddress('192.168.1.1/24')
    let ip2 = new IpAddress('1.1.1.1/8')
    ip.copy(ip2)
    expect(ip.equals(ip2)).toBe(true)
  })
  it('incr', ()=> {
    let ip = new IpAddress('192.168.1.1/24')
    ip.incr(200)
    expect(ip.equals(new IpAddress(`192.168.1.201/24`))).toBeTruthy()
  })
  it('decrease', ()=> {
    let ip = new IpAddress('192.168.1.200/24')
    ip.decrease(100)
    expect(ip.equals(new IpAddress(`192.168.1.100/24`))).toBeTruthy()
  })
  it('diff larger', ()=> {
    let ip = new IpAddress('192.168.1.200/24')
    let ip2 = new IpAddress(IpAddress.incr(ip.ip, 300))
    expect(ip2.diff(ip)).toEqual(300)
  })
  it('diff lesser', ()=> {
    let ip = new IpAddress('192.168.1.200/24')
    let ip2 = new IpAddress(IpAddress.decrease(ip.ip, 300))
    expect(ip2.diff(ip)).toEqual(-300)
  })
  it('overlap different prefix', ()=> {
    let ip = new IpAddress('192.168.1.200/16')
    let ip2 = new IpAddress('192.168.1.10/24')
    expect(ip.overlap(ip2)).toBeTruthy()
  })
  it('overlap same prefix', ()=> {
    let ip = new IpAddress('192.168.1.200/24')
    let ip2 = new IpAddress('192.168.1.10/24')
    expect(ip.overlap(ip2)).toBeTruthy()
  })
  it('none overlap', ()=> {
    let ip = new IpAddress('192.168.2.200/24')
    let ip2 = new IpAddress('192.168.1.10/24')
    expect(ip.overlap(ip2)).toBeFalsy()
  })
  
  it('subnet', ()=> {
    let ip = new IpAddress('192.168.1.1/24')
    expect(ip.subnet).toBe('192.168.1.0')
  })
  it('broadcast', ()=> {
    let ip = new IpAddress('192.168.1.1/24')
    expect(ip.broadcast).toBe('192.168.1.255')
  })
  it('cidr', ()=> {
    let ip = new IpAddress('192.168.11.1/23')
    expect(ip.cidr).toBe('192.168.10.0/23')
  })
  it('static incr 300', ()=> {
    let ip1 = '192.168.1.1'
    let ip2 = IpAddress.incr(ip1, 300)
    expect(ip2).toBe('192.168.2.45')
  })
  it('static decrease 300', ()=> {
    let ip1 = '192.168.1.1'
    let ip2 = IpAddress.incr(ip1, -300)
    expect(ip2).toBe('192.167.255.213')
  })
  it('static diff larger', ()=> {
    let ip1 = '192.168.1.1'
    let ip2 = IpAddress.incr(ip1, 300)
    let diff = IpAddress.diff(ip2, ip1)
    expect(diff).toBe(300)
  })
  it('static diff less', ()=> {
    let ip1 = '192.168.1.1'
    let ip2 = IpAddress.decrease(ip1, 300)
    let diff = IpAddress.diff(ip2, ip1)
    expect(diff).toBe(-300)
  })
  it('static mask to prefix', ()=> {
    expect(IpAddress.maskToPrefix('255.255.224.0')).toBe(19)
  })
  it('static prefix to mask', ()=> {
    expect(IpAddress.prefixToMask(19)).toBe('255.255.224.0')
  })
});
