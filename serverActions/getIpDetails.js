"use server";

import axios from "axios";

const getIpDetails = async (body) => {
  var { data: axres } = await axios.get("http://ip-api.com/json/" + body.ip);
  var deviceDetails = {
    ipDetails: axres.query,
    location: `${axres.country}, ${axres.regionName}, ${axres.city}`,
    provider: axres.as,
    isp: axres.isp,
    org: axres.org,
  };
  return deviceDetails;
};

export default getIpDetails;
