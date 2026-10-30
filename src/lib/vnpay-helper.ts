import crypto from 'crypto';

export function createVNPPaymentUrl(params: any) {
  const tmnCode = process.env.VNP_TMN_CODE!;
  const secretKey = process.env.VNP_HASH_SECRET!;
  const vnpUrl = process.env.VNP_URL!;
  if (!tmnCode || !secretKey || !vnpUrl) {
    throw new Error('Config Error: VNP_TMN_CODE / VNP_HASH_SECRET / VNP_URL is missing.');
  }
  
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes
  
  const vnp_Params: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(params.amount * 100), // VNPay expects amount * 100
    vnp_ReturnUrl: params.returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    ...params.extraParams
  };

  const sortedParams = sortObject(vnp_Params);
  
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  sortedParams['vnp_SecureHash'] = signed;
  
  const finalUrl = vnpUrl + '?' + new URLSearchParams(sortedParams).toString();
  return finalUrl;
}

export function verifyVNPCallback(vnp_Params: any) {
  const secretKey = process.env.VNP_HASH_SECRET;
  if (!secretKey) return false;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);
  const signData = new URLSearchParams(sortedParams).toString();
  
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return typeof secureHash === 'string' && secureHash.toLowerCase() === signed;
}

function sortObject(obj: any) {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

// VNPay expects yyyyMMddHHmmss in Vietnam time (GMT+7), regardless of the server's timezone.
function formatDate(date: Date) {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => ('0' + n).slice(-2);
  return `${vn.getUTCFullYear()}${pad(vn.getUTCMonth() + 1)}${pad(vn.getUTCDate())}${pad(vn.getUTCHours())}${pad(vn.getUTCMinutes())}${pad(vn.getUTCSeconds())}`;
}
