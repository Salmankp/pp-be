exports.filterKeys = filters => {
  if (Object.keys(filters).length === 0) return undefined;

  let keys = {
    ...(filters.cryptoCurrencyType && {
      cryptoCurrencyType: filters.cryptoCurrencyType
      // cryptoCurrencyType: {
      //   $regex: `^${filters.cryptoCurrencyType}$`,
      //   $options: "i"
      // }
    }),
    ...(filters.offerLocation && {
      offerLocation: { $regex: `^${filters.offerLocation}$`, $options: "i" }
    }),
    ...(filters.isVerified !== undefined && {
      isVerified: filters.isVerified
    }),
    ...(filters.offerTags !== false &&
      filters?.offerTags?.length > 0 &&
      filters.offerTags[0] !== "" && {
        offerTags: { $in: [...filters.offerTags] }
      }),
    ...(filters.paymentMethod !== undefined &&
      filters.paymentMethod !== "" && {
        "paymentMethodId.name": filters.paymentMethod
      }),
    ...(filters.amount !== undefined &&
      filters.amount !== "" && {
        tradeMin: { $lte: parseInt(filters.amount) }
      }),
    ...(filters.activeFilter !== undefined &&
      filters.activeFilter && {
        "user.lastSeenTime": {
          $gte: new Date(new Date().getTime() - 1000 * 60 * 10)
        }
      }),
    ...(filters.userType !== undefined &&
      filters.userType !== "" && {
        "user.role": filters.userType
      })
  };

  return keys;
};
