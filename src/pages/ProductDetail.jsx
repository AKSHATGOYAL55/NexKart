import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  Star,
  Package,
  Shield,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProduct } from "../api/product.api";
import { addItemToCart } from "../features/cartSlice";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import Image from '../components/common/Image'

const ProductDetail = () => {
  const { slug } = useParams();
  // slug comes from the URL — /products/apple-iphone-15-pro
  // useParams reads it as slug = "apple-iphone-15-pro"

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading: cartLoading } = useSelector((state) => state.cart);

  // ── Local State ────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // ── Fetch Product ──────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const product = data?.product;

  // ── Image Navigation ───────────────────────────────
  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  // ── Quantity Handlers ──────────────────────────────
  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => Math.min(product?.stock || 1, prev + 1));
  };

  // ── Add to Cart ────────────────────────────────────
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const result = await dispatch(
      addItemToCart({ productId: product._id, quantity }),
    );

    if (addItemToCart.fulfilled.match(result)) {
      toast.success(`${quantity} item(s) added to cart!`);
    } else {
      toast.error(result.payload || "Failed to add to cart");
    }
  };

  // ── Loading State ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading product..." />
      </div>
    );
  }

  // ── Error State ────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-xl font-semibold text-gray-700">
          Product not found
        </h2>
        <p className="text-gray-500 text-sm">
          The product you're looking for doesn't exist or has been removed
        </p>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  // ── Derived Values ─────────────────────────────────
  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;
  const isOutOfStock = product.stock === 0;
  const hasImages = product.images?.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Breadcrumb ───────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate("/products")}
          className="hover:text-blue-600 transition-colors"
        >
          Products
        </button>
        <span>/</span>
        <span className="text-gray-400">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* ── Main Product Section ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* ── Image Gallery ──────────────────────────── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square">
            {hasImages ? (
              <>
                {/* <img
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                /> */}

                <Image
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  wrapperClassName="w-full h-full"
                  eager={true}
                  // Product detail main image = above fold = load immediately
                />

                {/* Navigation arrows — only show if multiple images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`
                            rounded-full transition-all
                            ${
                              selectedImage === idx
                                ? "w-4 h-2 bg-blue-600"
                                : "w-2 h-2 bg-white/60"
                            }
                          `}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{discountPercentage}% OFF
                  </span>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={80} />
              </div>
            )}
          </div>

          {/* Thumbnail Row */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`
                    flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                    ${
                      selectedImage === idx
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ───────────────────────────── */}
        <div className="flex flex-col">
          {/* Brand + Category */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-blue-600 font-medium text-sm uppercase tracking-wide">
              {product.brand}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{product.category}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.ratings?.count > 0 ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= Math.round(product.ratings.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {product.ratings.average.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({product.ratings.count} reviews)
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">
              No reviews yet — be the first!
            </p>
          )}

          {/* Price Section */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded-full mb-0.5">
                    Save {formatCurrency(product.price - product.discountPrice)}
                  </span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? "bg-red-500" : "bg-green-500"
              }`}
            />
            {isOutOfStock ? (
              <span className="text-red-600 text-sm font-medium">
                Out of Stock
              </span>
            ) : (
              <span className="text-green-600 text-sm font-medium">
                In Stock
                {product.stock <= 10 && (
                  <span className="text-orange-500 ml-1">
                    (Only {product.stock} left!)
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={handleDecreaseQty}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-2.5 font-medium text-gray-900 border-x border-gray-300 min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncreaseQty}
                  disabled={quantity >= product.stock}
                  className="p-2.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            isLoading={cartLoading}
            className="w-full py-3 text-base mb-4"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* ── Trust Badges ─────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              {
                icon: Truck,
                text: "Free Delivery",
                sub: "On orders over ₹500",
              },
              {
                icon: RefreshCw,
                text: "Easy Returns",
                sub: "7 day return policy",
              },
              { icon: Shield, text: "Secure Payment", sub: "100% protected" },
            ].map(({ icon: Icon, text, sub }) => (
              <div
                key={text}
                className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl"
              >
                <Icon size={20} className="text-blue-600 mb-1.5" />
                <span className="text-xs font-medium text-gray-800">
                  {text}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Description + Specs Tabs ─────────────────── */}
      <ProductTabs product={product} />
    </div>
  );
};

// ─────────────────────────────────────────────────────
// TABS COMPONENT — Description and Specifications
// ─────────────────────────────────────────────────────

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    product.specifications?.size > 0 && {
      id: "specs",
      label: "Specifications",
    },
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-4 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "description" && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}

        {activeTab === "specs" && product.specifications && (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <tbody>
                {[...product.specifications.entries()].map(
                  ([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-3 px-4 font-medium text-gray-700 w-1/3 border-r border-gray-100">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{value}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
