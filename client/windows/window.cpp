#include "./pch.hpp"
#include "./window.hpp"


LRESULT window::onnchittest( HWND hWnd, int x, int y ) {
	return HTCAPTION;
}

void window::onpaint( HWND hWnd ) {
}

void window::onsettingchange( HWND hWnd, UINT action, LPCTSTR area ) {
}

void window::onlbuttondown(HWND hWnd, BOOL fDoubleClick, int x, int y, UINT keyFlags) {
	SetCapture( hWnd );
}

void window::onlbuttonup(HWND hWnd, int x, int y, UINT keyFlags){
	if ( GetCapture() == hWnd )
		ReleaseCapture();
}

void window::onmousemove(HWND hWnd, int x, int y, UINT keyFlags){
	if ( GetCapture() == hWnd ) {
	}
}

void window::onclose( HWND hWnd ) {
	PostQuitMessage( 0 );
}



