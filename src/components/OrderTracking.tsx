return (
  <div className="bg-white rounded-xl shadow-lg">
    {/* Header */}
    <div className="border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter order number or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Track Order
        </button>
      </div>
    </div>

    {error && (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )}

    {order && (
      <div className="p-6 space-y-8">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`font-medium capitalize ${
                      order.payment_status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Shipping Address
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="font-medium text-gray-900">
                  {order.shipping_address.firstName}{" "}
                  {order.shipping_address.lastName}
                </div>
                <div>{order.shipping_address.address}</div>
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.zipCode}
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-1 mt-2">
                    <Phone size={14} />
                    {order.customer_phone}
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    {order.customer_email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Status</h3>
            <div className="text-sm text-gray-600">
              Last updated:{" "}
              {tracking.length > 0
                ? formatDate(tracking[tracking.length - 1].updated_at)
                : "N/A"}
            </div>
          </div>

          {getCurrentStatus() && (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getStatusIcon(getCurrentStatus()!.id)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {getCurrentStatus()!.name}
                </div>
                <div className="text-sm text-gray-600">
                  {getCurrentStatus()!.description}
                </div>
                {tracking.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {tracking[tracking.length - 1].message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Order Progress</span>
              <span>{Math.round(getStatusProgress())}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStatusProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-6">Order Timeline</h3>
          <div className="space-y-6">
            {orderStatuses.map((status, index) => {
              const trackingEntry = tracking.find(
                (t) => t.status === status.id,
              );
              const isCompleted = trackingEntry !== undefined;
              const isCurrent = getCurrentStatus()?.id === status.id;
              const isPending = !isCompleted && !isCurrent;

              return (
                <div key={status.id} className="flex gap-4">
                  {/* Timeline Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${
                        isCompleted
                          ? "bg-green-100 border-green-500 text-green-600"
                          : isCurrent
                            ? "bg-blue-100 border-blue-500 text-blue-600"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                      }
                    `}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        getStatusIcon(status.id)
                      )}
                    </div>
                    {index < orderStatuses.length - 1 && (
                      <div
                        className={`
                        w-0.5 h-12 mt-2
                        ${isCompleted ? "bg-green-300" : "bg-gray-200"}
                      `}
                      ></div>
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-medium ${
                          isCompleted
                            ? "text-green-900"
                            : isCurrent
                              ? "text-blue-900"
                              : "text-gray-500"
                        }`}
                      >
                        {status.name}
                      </h4>
                      {trackingEntry && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          {formatDate(trackingEntry.created_at)}
                        </div>
                      )}
                    </div>

                    <p
                      className={`text-sm ${
                        isCompleted
                          ? "text-green-700"
                          : isCurrent
                            ? "text-blue-700"
                            : "text-gray-500"
                      }`}
                    >
                      {trackingEntry
                        ? trackingEntry.message
                        : status.description}
                    </p>

                    {trackingEntry?.tracking_number && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Tracking Number:
                        </span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {trackingEntry.tracking_number}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    )}

                    {trackingEntry?.estimated_delivery && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {formatDate(trackingEntry.estimated_delivery)}
                      </div>
                    )}

                    {trackingEntry?.location && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {trackingEntry.location}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Contact Support
              </h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>+91 1800-123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>support@framecraft.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Order Issues</h4>
              <div className="space-y-1">
                <button className="text-blue-600 hover:text-blue-700 text-left block">
                  Report a problem with this order
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-left block">
                  Request order cancellation
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-left block">
                  Modify shipping address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {!order && !loading && !error && (
      <div className="p-12 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Track Your Order
        </h3>
        <p className="text-gray-600 mb-6">
          Enter your order number or email address to track your custom frame
          order.
        </p>
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Sample Order Numbers:
            </h4>
            <div className="space-y-1 text-sm text-blue-700">
              <button
                onClick={() => setSearchQuery("FCF-123456")}
                className="block hover:underline"
              >
                FCF-123456
              </button>
              <button
                onClick={() => setSearchQuery("FCF-789012")}
                className="block hover:underline"
              >
                FCF-789012
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
