export class IpAddress {
  public oct: number[] = []
  public ip: string = ''
  public prefix: number = 0
  public mask: string = ''
  public subnet: string = ''
  public broadcast: string = ''
  public cidr: string = ''
  public valid: boolean = false

  constructor(dotstr: string) {
    this.valid = true
    // get the ip
    let match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,2})?$/.exec(dotstr)
    if (!match) {
      this.valid = false
      return
    }
    for (let i = 0; i < 4; i++) {
      let oct = parseInt(match[i + 1])
       if (oct > 255) {
        this.valid = false
        return
      }
      this.oct.push(oct) 
    }
    this.ip = this.oct.join('.')
    // get the prefix length
    match = /\/(\d{1,2})$/.exec(dotstr)
    if (!match) {
      this.prefix = 32
    } else {
      this.prefix = parseInt(match[1])
      if (this.prefix == 0 || this.prefix > 32) {
        this.valid = false
        return
      }
    }
    this.calMask()
  }

  public copy(ip: IpAddress): boolean {
    if (!ip.valid) return false
    for (let i = 0; i < 4; i++) {
      this.oct[i] = ip.oct[i]
    }
    this.ip = ip.ip
    this.prefix = ip.prefix
    this.calMask()
    return true
  }
  public equals(ip: IpAddress): boolean {
    return this.diff(ip) == 0 && this.prefix == ip.prefix
  }
  static maskToPrefix(mask: string): number {
    let match = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/.exec(mask)
    if (!match) return 0
    let prefix = 0
    for (let i = 1; i < 5; i++) {
      let oct = parseInt(match[i])
      for (let j = 7; j >= 0; j--) {
        let d = oct & (1 << j)
        if (d == 0) return prefix
        prefix++
      }
    }
    return prefix
  }
  static prefixToMask(prefix: number): string {
    if (prefix > 32 || prefix < 0) {
      return ''
    }
    let maskN = []
    for (let i = 0; i < 4; i++) {
      if (prefix >= 8) {
        maskN.push(255)
      } else if (prefix >= 0) {
        let octMask = 255 - (1 << (8 - prefix)) + 1
        maskN.push(octMask)
      } else {
        maskN.push(0)
      }
      prefix -= 8
    }
    return maskN.join('.')
  }
  static incr(ip: string, n: number): string {
    let match = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/.exec(ip)
    if (!match) {
      return ''
    }
    let carry = 0
    let result = [parseInt(match[1]),
    parseInt(match[2]),
    parseInt(match[3]),
    parseInt(match[4])]

    for (let i = 3; i >= 0; i--) {
      if (n == 0) break
      let oct = n & 255
      result[i] += oct + carry
      if (result[i] > 255) {
        carry = 1
        result[i] = result[i] - 256
      } else if (result[i] < 0) {
        carry = -1
        result[i] = result[i] + 256
      } else {
        carry = 0
      }
      n = (n >> 8)
    }
    return result.join('.')
  }
  static decrease(ip: string, n: number): string {
    return IpAddress.incr(ip, -n)
  }

  static diff(ip1: string, ip2: string): number {
    let ipAddress1 = new IpAddress(ip1)
    let ipAddress2 = new IpAddress(ip2)
    let retArray = [0,0,0,0]
    for (let i = 0; i<4; i++) {
      retArray[i] = ipAddress1.oct[i] - ipAddress2.oct[i]
    }
    return Math.pow(2, 24) * retArray[0] + Math.pow(2, 16) * retArray[1] + Math.pow(2, 8) * retArray[2] + retArray[3]
  }

  public incr(n: number): boolean {
    let ip = IpAddress.incr(this.ip, n)
    let newIp = new IpAddress(`${ip}/${this.prefix}`)
    return this.copy(newIp)
  }
  public decrease(n: number): boolean {
    return this.incr(-n)
  }

  public diff(ip: IpAddress): number {
    let retArray = [0,0,0,0]
    for (let i = 0; i<4; i++) {
      retArray[i] = this.oct[i] - ip.oct[i]
    }
    return Math.pow(2, 24) * retArray[0] + Math.pow(2, 16) * retArray[1] + Math.pow(2, 8) * retArray[2] + retArray[3]
  }

  public overlap(ip: IpAddress): boolean {
    return !(IpAddress.diff(this.subnet, ip.broadcast) > 0 || IpAddress.diff(this.broadcast, ip.subnet) < 0)
  }

  

  private calMask() {
    let prefix = this.prefix
    let maskN = []
    let subnet = []
    let broadcast = []

    for (let i = 0; i < 4; i++) {
      if (prefix >= 8) {
        maskN.push(255)
        subnet.push(this.oct[i])
        broadcast.push(this.oct[i])
      } else if (prefix >= 0) {
        let octMask = 255 - (1 << (8 - prefix)) + 1
        maskN.push(octMask)
        subnet.push(this.oct[i] & octMask)
        broadcast.push(this.oct[i] | (255 & (~octMask)))
      } else {
        maskN.push(0)
        subnet.push(0)
        broadcast.push(255)
      }
      prefix -= 8
    }
    this.mask = maskN.join('.')
    this.subnet = subnet.join('.')
    this.broadcast = broadcast.join('.')
    this.cidr = this.subnet + '/' + this.prefix
  }
}
