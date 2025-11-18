import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Métricas personalizadas
export const GetProductsDuration = new Trend('get_product_duration', true);
export const StatusOKRate = new Rate('status_ok_rate');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_product_duration: ['p(90)<6800'],
    status_ok_rate: ['rate>0.75']
  },

  stages: [
    { duration: '30s', target: 7 },
    { duration: '2m', target: 92 },
    { duration: '1m', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const url = 'https://dummyjson.com/products';

  const res = http.get(url);

  // Métricas
  GetProductsDuration.add(res.timings.duration);
  StatusOKRate.add(res.status === 200);

  // Check
  check(res, {
    'GET Products - Status 200': () => res.status === 200
  });
}
