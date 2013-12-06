#include "./pch.hpp"
#include "./window.hpp"

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



