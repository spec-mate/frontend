import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./styles/ProductDetailView.css";

export default function ProductDetailView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        console.log("✅ 상품 데이터:", res.data);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err.response || err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>상품 불러오는 중...</p>;

  return (
    <div className="product-detail-view">
      <div className="breadcrumb">PC 부품 정보 &gt; {product.type}</div>

      <h2 className="product-title">{product.name}</h2>

      <div className="tags">
        <span>#{product.manufacturer}</span>
        <span>#{product.type}</span>
        <span>등록일: {product.reg_date}</span>
      </div>

      <div className="product-box">
        <div className="product-info">
          {/* 왼쪽: 이미지 */}
          <div className="left">
            <img
              src={product.image || "/no-image.svg"}
              alt={product.name}
              className="product-detail-image"
            />
            <p className="manufacturer">제조사: {product.manufacturer}</p>
          </div>

          {/* 오른쪽: 상세 스펙 */}
          <div className="right">
            <div className="specs-tables">
              <table>
                <tbody>
                  {product.options &&
                    Object.entries(product.options).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{String(value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 최저가 */}
        <div className="price-box">
          <span>최저가 ({product.lowest_price?.option})</span>
          <strong>
            {product.lowest_price?.price
              ? `₩${Number(product.lowest_price.price).toLocaleString()}`
              : "정보 없음"}
          </strong>
          {product.lowest_price?.link && (
            <a
              href={product.lowest_price.link}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-link"
            >
              구매하기
            </a>
          )}
        </div>
      </div>

      {/* 가격 옵션 목록 */}
      <div className="price-options">
        <h3>판매 옵션</h3>
        <table>
          <thead>
            <tr>
              <th>옵션</th>
              <th>가격</th>
              <th>구매 링크</th>
            </tr>
          </thead>
          <tbody>
            {product.price_info?.map((opt, idx) => (
              <tr key={idx}>
                <td>{opt.option}</td>
                <td>₩{Number(opt.price).toLocaleString()}</td>
                <td>
                  <a href={opt.link} target="_blank" rel="noopener noreferrer">
                    바로가기
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
