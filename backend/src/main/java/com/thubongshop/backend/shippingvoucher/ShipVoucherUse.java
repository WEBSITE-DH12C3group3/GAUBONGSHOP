package com.thubongshop.backend.shippingvoucher;

import jakarta.persistence.*;

@Entity
@Table(name = "shipping_voucher_uses")
public class ShipVoucherUse {

    @EmbeddedId
    private ShipVoucherUseId id;

    @Column(name = "used_count", nullable=false)
    private Integer usedCount = 0;

    public ShipVoucherUseId getId() { return id; }
    public void setId(ShipVoucherUseId id) { this.id = id; }
    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    @Embeddable
    public static class ShipVoucherUseId implements java.io.Serializable {
        @Column(name = "voucher_id")
        private Integer voucherId;

        @Column(name = "user_id")
        private Integer userId;

        public ShipVoucherUseId() {}
        public ShipVoucherUseId(Integer voucherId, Integer userId) {
            this.voucherId = voucherId;
            this.userId = userId;
        }

        public Integer getVoucherId() { return voucherId; }
        public void setVoucherId(Integer voucherId) { this.voucherId = voucherId; }
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ShipVoucherUseId that = (ShipVoucherUseId) o;
            return java.util.Objects.equals(voucherId, that.voucherId) &&
                   java.util.Objects.equals(userId, that.userId);
        }
        @Override public int hashCode() {
            return java.util.Objects.hash(voucherId, userId);
        }
    }
}
